import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function mount(container){
  if(container.dataset.mounted)return;
  container.dataset.mounted='true';
  const stage=container.querySelector('.stage');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
  renderer.setClearColor(0,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,50);
  camera.position.set(3.3,3.25,6.2);camera.lookAt(0,1.18,0);
  const environment=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  scene.environment=environment.fromScene(room,.04).texture;room.dispose();environment.dispose();
  const key=new THREE.DirectionalLight(0xfff2db,1.8);key.position.set(-3,6,5);scene.add(key);
  const fill=new THREE.HemisphereLight(0xfff5e7,0xe4bbbf,.85);scene.add(fill);
  const gltf=await new GLTFLoader().loadAsync(new URL('piping.glb',import.meta.url).href);
  const piece=gltf.scene;scene.add(piece);piece.traverse(o=>{if(o.material?.name==="Rose buttercream")o.material.color.multiplyScalar(.82)});
  let nozzle;piece.traverse(o=>{if(o.name.startsWith('Open_star'))nozzle=o});
  const height=nozzle?.position.y||0;let frame=0,visible=false,current=0,initial=true;
  const reduced=()=>document.documentElement.dataset.motion==='reduced';
  function draw(){
    frame=0;if(!visible||reduced())return;
    const r=container.getBoundingClientRect();
    const target=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
    current=initial?target:current+(target-current)*.16;initial=false;
    piece.rotation.y=-.72+current*1.6;
    if(nozzle)nozzle.position.y=height+.28*(1-current);
    renderer.render(scene,camera);container.classList.add('ready');
    if(Math.abs(target-current)>.001)queue();
  }
  function queue(){if(!frame&&visible&&!reduced())frame=requestAnimationFrame(draw)}
  function size(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.left=-1.72*w/h;camera.right=-camera.left;camera.top=1.72;camera.bottom=-1.72;camera.updateProjectionMatrix();queue()}
  stage.append(renderer.domElement);new ResizeObserver(size).observe(stage);size();
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;queue()}).observe(stage);
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('bakery-motion',()=>{if(reduced())container.classList.remove('ready');else queue()});
  renderer.domElement.addEventListener('webglcontextlost',()=>container.classList.remove('ready'));
}
