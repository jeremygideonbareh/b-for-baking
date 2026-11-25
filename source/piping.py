import bpy, math, os
from mathutils import Vector
from math import sin,cos,pi
bpy.ops.wm.read_factory_settings(use_empty=True)
dest=os.path.abspath("assets")
def material(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    b=m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value=(*color,1);b.inputs["Metallic"].default_value=metal;b.inputs["Roughness"].default_value=rough
    return m
icing=material("Rose buttercream",(.86,.39,.45),0,.38)
silver=material("Polished confectioner's steel",(.82,.73,.63),.85,.21)
def mesh(name,verts,faces,mat):
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update()
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
    for p in d.polygons:p.use_smooth=True
    return o
def spiral(t):
    a=2*pi*2.05*t
    r=1.12*(1-t)**.83
    return Vector((r*cos(a),r*sin(a),.23+.53*t+.3*t**8))
verts=[];faces=[];n=220;k=48
for i in range(n+1):
    t=i/n; c=spiral(t)
    tangent=(spiral(min(t+.001,1))-spiral(max(t-.001,0))).normalized()
    u=tangent.cross(Vector((0,0,1))).normalized();v=tangent.cross(u).normalized()
    radius=.29*(1-.4*t)*min(1,.12+12*t)*min(1,max(.002,12*(1-t)))
    for j in range(k):
        q=j*2*pi/k;r=radius*(1+.17*cos(q*8+.8*t))
        verts.append(c+r*(u*cos(q)+v*sin(q)))
        if i:faces.append(((i-1)*k+j,(i-1)*k+(j+1)%k,i*k+(j+1)%k,i*k+j))
cream=mesh("One continuous piped rosette",verts,faces,icing)
verts=[];faces=[];s=96
for i,(z,r) in enumerate([(0,.15),(.18,.18),(.27,.19),(.34,.20),(1.15,.43),(1.22,.435),(1.24,.455),(1.29,.455),(1.31,.43)]):
    for j in range(s):
        a=2*pi*j/s;scallop=(1-cos(a*8))*.5
        zz=z+(.21*scallop if i==0 else .075*scallop if i==1 else 0)
        rr=r*(1-(.18*scallop if i==0 else 0))
        verts.append((rr*cos(a),rr*sin(a),zz))
        if i:faces.append(((i-1)*s+j,(i-1)*s+(j+1)%s,i*s+(j+1)%s,i*s+j))
noz=mesh("Open star pastry nozzle",verts,faces,silver);noz.location=(.07,0,1.18);noz.rotation_euler=(0,.37,-.12)
solid=noz.modifiers.new("Rolled steel wall","SOLIDIFY");solid.thickness=.018
bevel=noz.modifiers.new("Soft edges","BEVEL");bevel.width=.012;bevel.segments=3
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(dest,'piping.glb'),export_format='GLB',use_selection=True,export_yup=True)
s=bpy.context.scene;s.render.engine="CYCLES";s.cycles.samples=14;s.cycles.use_denoising=True
s.world=bpy.data.worlds.new("Studio");s.world.use_nodes=True;s.world.node_tree.nodes.get("Background").inputs[0].default_value=(.8,.74,.72,1)
def point(o,at):o.rotation_euler=(Vector(at)-o.location).to_track_quat('-Z','Y').to_euler()
for loc,w,size in [((-3,-4,6),650,4),((4,2,5),900,3),((-4,3,2),470,2)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=w;o.data.shape='DISK';o.data.size=size;point(o,(0,0,.7))
bpy.ops.object.camera_add(location=(3.6,-6.2,3.65));s.camera=bpy.context.object;point(s.camera,(0,0,1.15));s.camera.data.type="ORTHO";s.camera.data.ortho_scale=3.65
s.render.resolution_x=720;s.render.resolution_y=720;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.filepath=os.path.join(dest,"piping.png")
bpy.ops.render.render(write_still=True)

