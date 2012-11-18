#!/usr/bin/python
# -*- coding: utf-8 -*- 
# needs mayavi2
# run with ipython -wthread

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.cm as cm
plt.ioff()
import networkx as nx
import time
import numpy as np
import sys,os
sys.path.append('/iscpif/users/cointet/install/lib/python2.7/site-packages/')

import pyparsing
import sqlite3
import random
import math
from copy import deepcopy
import jsonpickle
import copy
#import layout


class Tube:
	pass

class Edge:
	pass
	
def renormalisation(vpos,periodes):
	xmax,xmin,largeur = {},{},{}
	for inter in periodes:
		xmax[inter] = 0.
		xmin[inter] = 1.
	
	for x in vpos.values():
		xmax[x[1]] = max(x[0],xmax[x[1]])
		xmin[x[1]] = min(x[0],xmin[x[1]])

	for inter in periodes:
		largeur[inter] = xmax[inter]-xmin[inter]
	vpos_norm = {}
	for u,x in vpos.iteritems():
		x[0]=(x[0] - xmin[x[1]] )/largeur[x[1]]
		vpos_norm[u]=x
	return vpos_norm

def renormalisation_globale(vpos):
	#on rajoute une fonction pour empêcher un noeud de partir a perpete
	xmax,xmin,largeur =0.,1.,0.
	for x in vpos.values():
		xmax = max(x[0],xmax)
		xmin = min(x[0],xmin)
	largeur = xmax-xmin
	vpos_norm = {}
	for u,x in vpos.iteritems():
		x[0]=(x[0] - xmin )/largeur
		vpos_norm[u]=x
	solong=0.2	
	nb_voisins_min=2
	for u,x1 in vpos_norm.iteritems():
		voisins=0
		for v,x2 in vpos_norm.iteritems():
			if x2[1] == x1[1] and u!=v:
				if abs(x2[0]-x1[0]) <solong: 
					voisins += 1#dist_min = min(dist_min,abs(x2[0]-x1[0]))
		
		if voisins < nb_voisins_min:
			print '*************ca derive*************'
			if x1[0]<0.5:
				vpos_norm[u][0] += solong
			else:
				vpos_norm[u][0] -= solong
	return vpos_norm

def crosscount(edge1,edge2,vpos):
  # Convert the number list into a dictionary of person:(x,y) 
#	loc=dict([(people[i],(v[i*2],v[i*2+1])) for i in range(0,len(people))]) 
#	total=0 
	# Loop through every pair of links 
#	for i in range(len(links)): 
#		for j in range(i+1,len(links)): 
# Get the locations 
	#print edge1
	u1 = edge1[0]
	v1 = edge1[1]
	u2 = edge2[0]
	v2 = edge2[1]
	(x1,y1),(x2,y2)=vpos[u1],vpos[v1]
	(x3,y3),(x4,y4)=vpos[u2],vpos[v2]
	den=(y4-y3)*(x2-x1)-(x4-x3)*(y2-y1)

	if abs(den)>0:
		ua=((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/den 
		ub=((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/den
	# 	# If the fraction is between 0 and 1 for both lines 
	# 	# then they cross each other 
		if ua>0 and ua<1 and ub>0 and ub<1: 
			return 1 
		else:
			return 0
	else:
		return 0
	# (x1,y1),(x2,y2)=pos[links[i][0]],loc[links[i][1]] 
	# (x3,y3),(x4,y4)=loc[links[j][0]],loc[links[j][1]] 
	# den=(y4-y3)*(x2-x1)-(x4-x3)*(y2-y1) 
	# # den==0 if the lines are parallel 
	# if den==0:
	# 	# Otherwise ua and ub are the fraction of the 
	# 	# line where they cross 
	# 	ua=((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/den 
	# 	ub=((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/den
	# 	# If the fraction is between 0 and 1 for both lines 
	# 	# then they cross each other 
	# 	if ua>0 and ua<1 and ub>0 and ub<1: 
	# 		total+=1 

# 
# def repulsion(vpos,G,epaisseur_0,gamma = 0.004):
# 	vital_area = 0.01
# 	alpha = 0.001
# 	numero = 0
# 	disp_v = []
# 	moyenne_v=[]
# 	for v in G:
# 		for u in G:
# 			numero =numero +1
# 			if vpos[u][1] == vpos[v][1] and u!=v:# and (vpos[v][1]==5 or  vpos[v][1]==2):
# 				x_u = vpos[u][0]
# 				x_v = vpos[v][0]
# 				x_moy = (x_u+x_v)/2.
# 				e_u = epaisseur_0[u]
# 				e_v = epaisseur_0[v]
# 				if x_v == x_u:
# 					vpos[v][0] = vpos[v][0] + 0.000001
# 					vpos[u][0] = vpos[u][0] - 0.000001
# 					delta_x_0 = 0.000002
# 				else:
# 					delta_x_0= x_v - x_u
# 				
# 				epaisseur_uv=(e_v+e_u)*gamma
# 				if x_u<x_v:
# 					ordre = 1 # u puis v					
# 				else:
# 					ordre = 0 # v puis u
# 					delta_x_0=-delta_x_0
# 				delta_x = delta_x_0-epaisseur_uv 
# 
# 				if delta_x<vital_area:
# 					
# 					#disp_x = min(0.002,alpha/(math.fabs(delta_x))**2)
# 					disp_x = (math.fabs(delta_x) + vital_area)/2
# 					disp_x = vital_area
# 					#disp_x = vital_area*2
# 					disp_v.append(disp_x)
# 					moyenne_v.append(x_moy)
# 					print delta_x,delta_x_0, epaisseur_uv, disp_x
# 					#if numero <300:
# 					#	print delta_x_0,delta_x,disp_x,math.fabs(delta_x)					
# 					
# 	mem = 1	
# 	for disp_x,x_moy in zip(disp_v,moyenne_v):
# 		print x_moy,disp_x
#  	vpos2=deepcopy(vpos)
# 	for w in G:
# 		for disp_x,x_moy in zip(disp_v,moyenne_v):
# 			if 1: #vpos[w][1]==5 or  vpos[w][1]==2:
# 				distance = abs(x_moy-vpos[w][0])
# 				deplacement=alpha*disp_x / math.pow(max(vital_area,distance),2.)
# 				if vpos[w][0]<x_moy:
# 					vpos2[w][0] = vpos2[w][0] - deplacement
# #					print "deplacement" + str(deplacement)
# 				elif vpos[w][0]>x_moy:
# 					vpos2[w][0] = vpos2[w][0] + deplacement
# 				else:
# 					print 'brisqkslqmlksqmlkqds'
# 		#vpos = renormalisation_globale(vpos)
# 	return vpos2

def mean(numberList):
    floatNums = [float(x) for x in numberList]
    return sum(floatNums) / len(numberList)


def repu(G,vpos,v,epaisseur_0,displacement_max):
	vital_area = 0.008
	alpha = 0.000003
	gamma = 0.0004
	max_e=0
	for u in G:
		if vpos[u][1] == vpos[v][1] and u!=v:
			x_u = vpos[u][0]
			x_v = vpos[v][0]
			if abs(x_u-x_v)<0.2:
				x_moy = (x_u+x_v)/2.
				e_u = epaisseur_0[u]
				e_v = epaisseur_0[v]
				if x_v == x_u:
					vpos[v][0] = vpos[v][0] + 0.000001
					vpos[u][0] = vpos[u][0] - 0.000001
					delta_x_0 = 0.000002
				else:
					delta_x_0= x_v - x_u
				epaisseur_uv=(e_v+e_u)*gamma
				#max_e = max(e_v * gamma,max_e)
				if x_u<x_v:
					ordre = 1 # u puis v				    	
				else:
					ordre = 0 # v puis u
					delta_x_0=-delta_x_0
				delta_x = delta_x_0-epaisseur_uv
				if delta_x<0:
					deplacement = vital_area-delta_x
				else:
					deplacement=alpha / math.pow(max(vital_area,delta_x),2.)*displacement_max
				#if delta_x<0:
				#	deplacement= vital_area + epaisseur_uv/2
				if vpos[u][0]<x_moy:
					vpos[u][0] = vpos[u][0] - deplacement
					#print "deplacement" + str(deplacement)
				elif vpos[u][0]>x_moy:
					vpos[u][0] = vpos[u][0] + deplacement
				#print 'repulsion de ' + str(deplacement)
	#print max_e
	return vpos
	
	
def move_edge(edge,vpos,epaisseur_0,G,syn_coeff,dia_coeff,displacement_max,beta,disp_vect,i):
	u = edge[0]
	v = edge[1]
	x_u = vpos[u][0]
	x_v = vpos[v][0]
	e_u = epaisseur_0[u]
	e_v = epaisseur_0[v]
	
	#attraction							
	stre = G[v][u]['weight']
	type_lien  = G[v][u]['key']#0 synchrone
	if type_lien==1:
		#stre=stre*math.sqrt(rect)
		stre = dia_coeff/(syn_coeff+dia_coeff)*stre
	else:
		#stre=stre/math.sqrt(rect)				
		stre = syn_coeff/(syn_coeff+dia_coeff)*stre
	if x_u<x_v:
		ordre = 1
		delta_x_0= x_v - x_u
	else:
		ordre = 0
		delta_x_0= x_u - x_v
	#delta_x_0 = min(delta_x_0,1-delta_x_0)#espace cyclique
	disp_x = min(delta_x_0,displacement_max*beta*stre*math.fabs(delta_x_0))

	temp = disp_vect[i]
	#if disp_x != 0.:
	temp.append(abs(disp_x))
	disp_vect[i] = temp

	#on prend en compte l'inertie des noeuds
	degu = G.degree(u, weighted=True)
	degv = G.degree(v, weighted=True)
	coeffu = degv/(degu+degv)
	coeffv = degu/(degu+degv)
	if ordre==0:
		
		vpos[u][0]=vpos[u][0]-disp_x * coeffu
		vpos[v][0]=vpos[v][0]+disp_x * coeffv
	else:
		vpos[u][0]=vpos[u][0]+disp_x * coeffu
		vpos[v][0]=vpos[v][0]-disp_x * coeffv
	
	#repulsion								
	vpos = repu(G,vpos,v,epaisseur_0,displacement_max)
	return vpos,disp_vect	
	


def get_G_pos_rand(distance_components,list_term=[]):
	G=nx.DiGraph()
	for x in list_term:
		G.add_node(x) 
	stress=[]
	for x,dist in distance_components.iteritems():
		for voisin,stre in dist.iteritems():
			stress.append(stre)
	try:
		stremax=max(stress)
	except:
		stremax=1.
	for x,dist in distance_components.iteritems():
		for voisin,stre in dist.iteritems():
			G.add_edge(x,voisin)
			G[x][voisin]['weight'] = float(stre)/stremax
	vpos = nx.random_layout(G,dim=2)
	return G,vpos





		
def spring_layout_1d(G, periodes,epaisseur,iterations=20, dim=2, node_pos=None):
	epaisseur_0={}
	for u,e in epaisseur.iteritems():
		epaisseur_0[u] =np.power(epaisseur[u],1)

	"""Spring force model layout"""
	beta = 1. #coefficient d'attraction
	gamma = 0.0008 # evitement overlap
	vpos=node_pos
	disp_vect={}
	displacement_max_v = [float(iterations-x)/float(iterations) for x in range(iterations)]

	#first round considering only synchronous links
	print 'consider first synchronous links'
	for i in range(0,iterations):
		print "iteration:" + str(i) +'/'+str(iterations)
		dia_coeff=0.
		syn_coeff=10.
		disp_vect[i]=[]
		#colding_speed = 0.5
		#displacement_max = np.power(20/(float(i+1)),colding_speed)
		displacement_max=displacement_max_v[i]
		print "disp_max:" +str(displacement_max)
		edges_list = [e for e in G.edges_iter()]
		for edge in edges_list:
			vpos,disp_vect=move_edge(edge,vpos,epaisseur_0,G,syn_coeff,dia_coeff,displacement_max,beta,disp_vect,i)
		vpos = renormalisation_globale(vpos)
		print 'deplacement total: '+ str(sum(disp_vect[i]))   + '\tdeplacement moyen: ' + str(mean(disp_vect[i])) + '\tdeplacements positifs moyens: ' + str(mean([x for x in disp_vect[i] if x>0]))
	
	print 'and add then asyncrhonous connections.'	
	iterations=iterations*2
	for i in range(0,iterations):
		print "iteration:" + str(i) +'/'+str(iterations)
		dia_coeff=40.
		syn_coeff=20.
		disp_vect[i]=[]
		#colding_speed = 0.5
		#displacement_max = np.power(20/(float(i+1)),colding_speed)
		displacement_max=displacement_max_v[i/2]
		print "disp_max:" +str(displacement_max)
		edges_list = [e for e in G.edges_iter()]
		for edge in edges_list:
			vpos,disp_vect=move_edge(edge,vpos,epaisseur_0,G,syn_coeff,dia_coeff,displacement_max,beta,disp_vect,i)
		vpos = renormalisation_globale(vpos)
		print 'deplacement total: '+ str(sum(disp_vect[i]))   + '\tdeplacement moyen: ' + str(mean(disp_vect[i])) + '\tdeplacements positifs moyens: ' + str(mean([x for x in disp_vect[i] if x>0]))
	
	return vpos



	

def plot_graph(liens_totaux_syn,liens_totaux_dia,clusters):
	
	#on initialise le graphe
	G=nx.Graph()

	nb_iterations=40
	forces,edge_colors=[],[]
	
	
	
	for lien in liens_totaux_syn:
		G.add_edge(int(lien[0]), int(lien[1]), weight = float(lien[2]),key = 0)
		G.add_edge(int(lien[1]), int(lien[0]), weight = float(lien[2]),key = 0)
		forces.append(4.5*float(lien[2]))
		forces.append(4.5*float(lien[2]))

	for lien in liens_totaux_dia:
		G.add_edge(int(lien[0]), int(lien[1]), weight =  float(lien[2]),key = 1)
		G.add_edge(int(lien[1]), int(lien[0]), weight =  float(lien[2]),key = 1)
		forces.append(4.5*float(lien[2]))
		forces.append(4.5*float(lien[2]))
	vpos=nx.random_layout(G, dim=2)

	#print vpos
	epaisseur = {}
	periodes=[]
	vert_pos={}
	labels={}

	for k,row in clusters.iteritems():
		periode=int(row['periode'])
		labels[k] = k
		vpos[k][1]=periode
		if not periode in periodes:
			periodes.append(periode)
		try:
			epaisseur[k] = 4+int(4 * float(row['epaisseur']))
		except:
			epaisseur[k] = 4
		vert_pos[k] = periode
	#normalisation des épaisseurs:
	epaisseur_norm={}
	width_total = sum(epaisseur.values())
	for k,width in epaisseur.iteritems():
		epaisseur_norm[k] = float(width) / width_total * 1000.
	epaisseur=epaisseur_norm
	print 'order'
	#print G.order()
	vpos_0 = deepcopy(vpos)

	print "computing graph layout"	
	#print vpos

	#pos = layout.spring_layout(G,vert_pos,dim=2,pos=None,fixed=None,iterations=500,weighted=True,scale=1)
	pos = spring_layout_1d(G,periodes,epaisseur,iterations=nb_iterations,dim=2,node_pos=vpos_0)
	epaisseur_0={}
	for u,e in epaisseur.iteritems():
		epaisseur_0[u] =np.power(epaisseur[u],1)

	for x in G.edges(data=True):
		if x[2]['key']==0:
			G.remove_edge(*x[:2])
	forces_plot=[]
	for x in forces:
		forces_plot.append(x*1.)
	nx.draw_networkx_edges(G,pos,None,width=forces_plot,arrows=arrows)
	nx.draw_networkx_nodes(G,pos,None,epaisseur.values())
	
	#nx.draw_networkx_labels(G,pos,labels,font_size=12,font_color='blue')
	print 'labels added'
	i = random.randint(1,10)
	plt.savefig(path_req + str(i) + '.png')
	return G,epaisseur_0,pos


def get_pos(liens_totaux_syn,liens_totaux_dia,clusters):
	G,epaisseur_0,pos=plot_graph(liens_totaux_syn,liens_totaux_dia,clusters)
	return pos


def get_G(clusters,syn=False):
	G=nx.Graph()
	for x,clu in clusters.iteritems():
		G.add_node(x)
		if 'dia' in clu:
			for voisin,stre in clu['dia'].iteritems():
				G.add_edge(int(x),int(voisin))
		if syn==True:
			if 'syn' in clu:
				for voisin,stre in clu['syn'].iteritems():
					G.add_edge(int(x),int(voisin),weight=float(stre))
	return G

def connect(G):
	return nx.connected_components(G)
	
def add(c,tuplet):
	final=[]
	for x,y in zip(list(c),list(tuplet)):
		final.append(x+y)
	return tuple(final)
def norm_tuple(c,N):
	final=[]
	for x in list(c):
		final.append(float(x)/float(N))
	return tuple(final)
	
def delta(vpos,delta=0.05):
	vpos_delta = deepcopy(vpos)
	for x,pos in vpos_delta.iteritems():
		vpos_delta[x][1]=pos[1]-delta
	return vpos_delta	


def firstmaj(chaine):
	if len(chaine)>1:
		return chaine[0].upper()  + ''.join(chaine[1:])
	else:
		return chaine[0].upper()
		
def easylabel(label,circles,simplified_label=False):
	#if not circles:
	if '_' in label:
		label=label.replace('P NATL ACAD SCI USA','PNAS')
		label=label.replace('p natl acad sci usa','pnas')
		label=label.replace('new engl j med','nejm')
		label=label.replace('NEW ENGL J MED','NEJM')
		label=label.replace('curr opin biotech','cur opin biot')

		#remove dates
		if simplified_label:
			for i in range(1700,2040):
		 		label=label.replace(str(i)+'_','')
		#remove initials
		label_u = label.split('_')	
		#benjamini y_1995_j roy stat soc b met
		label_u[0] = ' '.join(map(lambda x: firstmaj(x),label_u[0].split(' ')[:-1]))
		label_u[-1]=label_u[-1].upper()
		
		if simplified_label:
			label = ' '.join(label_u)	
		else:
			label = ', '.join(label_u)	
		
	return label


def radar(dict_item_years,mini,maxi,logscale):
	import matplotlib.pyplot as plt
	from matplotlib.path import Path
	import matplotlib.patches as patches
	import math
	print 'mini,maxi',mini,maxi
	print 'dict_item_years',dict_item_years
	years = dict_item_years.values()
	mini_y = int(min(years))
	maxi_y = int(max(years))
	years = range(mini_y,maxi_y+1)
	nb_ticks=6
	if len(years)>nb_ticks:
		steps = int(len(years)/nb_ticks)
		years_real = [x for x in years if years.index(x)%steps==0]
		if 2000 in years:
			next2000=20000
			nearest=2000000
			for y in years_real:
				if math.fabs(2000-y)<nearest:
					next2000=y
					nearest=math.fabs(2000-y)
			years_real=[x-nearest for x in years_real]
			
	else:
		years_real = years

	nb_subticks=22
	# print 'years',years
	if len(years)>nb_subticks:
		steps_sub = int(len(years)/nb_subticks)
		years_real_sub = [x for x in years if years.index(x)%steps_sub==0]
	else:
		years_real_sub = years

	# print 'years_real_sub',years_real_sub
	# print 'years_real',years_real
	# pos_multi[u][0] = 0.01 + math.cos(alpha) * r
	# pos_multi[u][1] = 0.5 + math.sin(alpha) * r  /  (2.6*math.sin(max_angle))
	fig = plt.figure()
	fig.patch.set_facecolor('white')
	fig.patch.set_alpha(1)
	ax = fig.add_subplot(111)
	angle=72
	factor=(2.4*math.sin(angle))
	for r in years_real_sub:
		alpha = angle/2
		alpha= math.radians(alpha)
		print alpha
		if logscale:
			rtick =  (math.exp(((float(r)-min(years))/(max(years)-min(years)))+mini)-1)/(math.exp(1.)-1.)#*(maxi-mini)+mini
		else:
			rtick =  ((float(r)-min(years))/(max(years)-min(years)))+mini#*(maxi-mini)+mini
		if r in years_real:
			patch = patches.Arc((0.0,0.5), 2*rtick, 2*rtick, theta1=-angle/2,theta2=angle/2,angle=0.0,linestyle='dashed',alpha=0.5,edgecolor='grey',lw=.5)#, theta1=-.0, theta2=30.0)
			ax.add_patch(patch)
			ax.text(rtick * math.cos(alpha)-0.05,.48+rtick * math.sin(-alpha), str(r),size=9,rotation=-30,color='grey')
		else:
			patch = patches.Arc((0.0,0.5), 2*rtick, 2*rtick, theta1=-angle/2,theta2=angle/2,angle=0.0,linestyle='dotted',alpha=0.5,edgecolor='grey',lw=.2)#, theta1=-.0, theta2=30.0)
			ax.add_patch(patch)
			

	#verts = [(0,0.5),(rtick * math.cos(alpha),.5+rtick * math.sin(alpha))]
	verts = [(0,0.5),(rtick*math.cos(alpha),.5+rtick*math.sin(alpha))]
	codes = [Path.MOVETO,
	         Path.LINETO]
	path = Path(verts, codes)
	patch = patches.PathPatch(path,facecolor='none',edgecolor='grey', lw=1)
	ax.add_patch(patch)

	#verts = [(0,0.5),(rtick * math.cos(-alpha),.5+rtick * math.sin(-alpha))]
	verts = [(0,0.5),(rtick*math.cos(-alpha),.5+rtick*math.sin(-alpha))]
	codes = [Path.MOVETO,
	         Path.LINETO]
	path = Path(verts, codes)
	patch = patches.PathPatch(path,facecolor='none',edgecolor='grey', lw=1)
	ax.add_patch(patch)
	

	# xs, ys = zip(*verts)
	# ax.plot(xs, ys, 'x--', lw=2, color='black', ms=10)
	# 
	# ax.text(-0.05, -0.05, 'P0')
	# ax.text(0.15, 1.05, 'P1')
	# ax.text(1.05, 0.85, 'P2')
	# ax.text(0.85, -0.05, 'P3')
	# 
	# ax.set_xlim(-0.1, 1.1)
	#ax.set_ylim(0., 1.)
	#plt.show()
	
def meantuple(tuple1,tuple2):
	tuplemean = []
	for x,y in zip(list(tuple1),list(tuple2)):
		tuplemean.append((x+y)/2.)
	return tuple(tuplemean)



def detect_label_positions(names, labels, embedding,font_size,font_color,font_family,deltavpos):
	print 'len(labels)',len(labels)
	for index, (name, label, (x, y)) in enumerate(
		zip(names, labels, embedding.T)):
		#print 'index,name,label,(x,y)',index,name,label,(x,y)
		dx = x - embedding[0]
		#print 'dx',dx
		dx[index] = 1
		dy = y - embedding[1]
		dy[index] = 1
		deltavpos_local=deltavpos/2
		print '\n'
		print 'dx,dy',dx,dy
		print 'np.argmin(np.abs(dx)),np.argmin(np.abs(dy))',np.argmin(np.abs(dx)),np.argmin(np.abs(dy))
		
		print name
		print 'x,y:',x,',',y

		distance_euclidienne = dx*dx+dy*dy
		# dx=dx[distance_euclidienne<0.08]
		# dy=dy[distance_euclidienne<0.08]
		
		
		try:
			#this_dx = dx[np.argmin(np.abs(dx))]
			this_dx=dx[np.argmin(np.abs(distance_euclidienne))]
			
		except:
			this_dx = 0 
		try:
			#this_dy = dy[np.argmin(np.abs(dy))]
			this_dy=dy[np.argmin(np.abs(distance_euclidienne))]
		except:
			this_dy=0

		if this_dx < 0:
			horizontalalignment = 'right'
			x = x - deltavpos_local
		elif this_dx > 0:
			horizontalalignment = 'left'
			x = x + deltavpos_local
		else:
			horizontalalignment = 'center'
		if this_dy < 0:
			verticalalignment = 'top'
			y = y - deltavpos_local
		elif this_dy>0:
			verticalalignment = 'bottom'
			y = y + deltavpos_local
		else:
			verticalalignment = 'center'
			y = y - deltavpos_local

		#print "this_dx,this_dy:",this_dx,',',this_dy

		# this_dx = dx[np.argmin(np.abs(dx))]
		# this_dy = dy[np.argmin(np.abs(dy))]
		# if this_dx > 0:
		# 	horizontalalignment = 'right'
		# 	x = x - deltavpos_local
		# else:
		# 	horizontalalignment = 'left'
		# 	x = x + deltavpos_local
		# if this_dy > 0:
		# 	verticalalignment = 'top'
		# 	y = y - deltavpos_local
		# else:
		# 	verticalalignment = 'bottom'
		# 	y = y + deltavpos_local
		# print horizontalalignment,verticalalignment
		
		plt.text(x, y, label, size=font_size,
				horizontalalignment=horizontalalignment,
				verticalalignment=verticalalignment,
				color= font_color,
				family='DejaVu Sans')
				# bbox=dict(facecolor='w',
				# 		  edgecolor='black',
				# 		  #edgecolor=plt.cm.spectral(label / float(n_labels)),
				# 		  alpha=.6))

	
	
def plot_graph_G(G,vpos,filename,title,nb_colors,show=0,colors_final={},only_high=False,inverse=False,scalex=1.,circles=True,pos2d={},poids={},arrows=False,radial=False,logscale=False,show_labels=True,scale_nodes=True,color_edges=False,simplified_label=False,avoid_label_overlap=True):
	starttimesub= time.time()
	print '$$$$$$$$$$ entering plot_graph_G ',': ',(time.time()-starttimesub), ' seconds'
	homogeneize=[False,0,0,10]
	try:
		projected_entity=poids[0]
		try:
			local_years=poids[2]
		except:
			local_years=['']
		print 'local_years',local_years
		poids=poids[1]
		print 'poids',poids
		#then homogeneize poids if dynamical
		try:
			minvalue=99999999999
			maxvalue=-99999999999
			for local_y in local_years:
				if local_y=='':
					homogeneize = [False,0,0,10]
					no_homo=True
				#print 'poids[local_y]',local_y,poids[local_y]
				else:
					try:
						minvalue = min(min(poids[local_y].values()),minvalue)
						maxvalue=max(max(poids[local_y].values()),maxvalue)
					except:
						pass
					if minvalue>0:
						minvalue=0
					if minvalue>maxvalue:
						maxvalue=minvalue
					homogeneize = [True,minvalue,maxvalue,10]
					no_homo=False
					
			#print "homogeneize heatmap colors: maxvalue,minvalue",maxvalue,minvalue
		except:
			pass
		print "homogeneize",homogeneize

	except:
		local_years=['']
		no_homo=True
		pass

	try:
		if not len(poids.keys())==0:
			heatmap=True
			circles=False
		else:
			heatmap=False
		
	except:
		heatmap=False
	
	for local_y in local_years:	
		#print 'local_y in netlay',local_y
		epaisseurs=[]
		width_e=[]
		shapes=[]
		display_parameters={}
		N = G.number_of_nodes()
		homogeneize[3]=N
	
		if 'philippecointet' in os.getcwd():
			fig=plt.figure(figsize=(8*scalex, 6))
		else:
			fig=plt.figure( figsize=(8*scalex, 8))
		if heatmap:
			if not local_y=='':
				plot_heatmap(pos2d,poids[local_y],fig,homogeneize)
			else:
				plot_heatmap(pos2d,poids,fig,homogeneize)
			heatmap_scale=1.22

		if not radial==False: 
			mini=9999999999999
			maxi=-9999999999999
			for noeuds, posi in vpos.iteritems():
				if posi[0]<mini:
					mini=posi[0]
				if posi[0]>maxi:
					maxi=posi[0]
				print posi,mini,maxi
			radar(radial,mini,maxi,logscale)
			pass

		#print 'vpos',vpos
		plt.axis([-0.16, 1.16, -0.16, 1.16])
		ok=[]
		weights_node=[]
		#avoid_label_overlap=False
		
		if inverse==True:
			for node,pos_node in vpos.iteritems():
				new_pos=pos_node.copy()
				new_pos[0]=pos_node[1]
				new_pos[1]=pos_node[0]
				vpos[node]=new_pos

		if N>100:
			scaling_factor = math.sqrt(100./float(N))#diminishes the size of nodes/edges according to the number of nodes
		else:
			scaling_factor=1.
		for x in G.nodes():
			if G.node[x]['level']=='low':
				weights_node.append(G.node[x].get('weight',1))
			if only_high==True:
				weights_node.append(G.node[x].get('weight',1))

		inv_colors_final={}
		for k, vl in colors_final.iteritems():
		    for v in vl:
				inv_colors_final[v] = k

		
		print '$$$$$$$$$$ before drawing nodes ',': ',(time.time()-starttimesub), ' seconds'
		starttimesub= time.time()
		for x in G.nodes():
		
			if inv_colors_final.get(x,0)==0:
				inv_colors_final[x]=nb_colors
			#print x,inv_colors_final.get(x,0)
			c=cm.spectral((float((inv_colors_final.get(x,0)))/nb_colors),1)
			#print 'x,c,inv_colors_final.get(x,0)',x,c,inv_colors_final.get(x,0)
			if G.node[x]['level']=='low' and not G.node[x]['category']=='tag' :
				display_parameters[x]={}
			
				if scale_nodes:
					node_size=scaling_factor*max(4,int(100*float(G.node[x].get('weight',1.))/float(max(weights_node))))
				else:
					node_size=scaling_factor*1				
				if heatmap:
					node_size=node_size/heatmap_scale
				#if N>2000:
				#	nx.draw_networkx_nodes(G,vpos,nodelist=[x],node_size=node_size,node_shape='o',node_color=c,linewidths=0)
				#else:
				nx.draw_networkx_nodes(G,vpos,nodelist=[x],node_size=node_size,node_shape=G.node[x].get('shape','o'),node_color=c,linewidths=0)
				display_parameters[x]['color']=c
				#display_parameters[x]['size']=str(node_size)
				display_parameters[x]['size']=str(G.node[x].get('weight',1.))
				
			if G.node[x]['level']=='high' and  not G.node[x]['category']=='tag'  and circles:
				display_parameters[x]={}
				node_size=2*max(4,int(100*float(G.node[x].get('weight',1.))))#/float(max(weights_node))))
				if only_high:
					node_size=node_size/float(max(weights_node))
				nx.draw_networkx_nodes(G,vpos,nodelist=[x],node_size=node_size,node_shape=G.node[x].get('shape','o'),node_color=c,alpha = 0.1,linewidths=0.1)
				display_parameters[x]['size']=str(node_size)
				display_parameters[x]['size']=str(G.node[x].get('weight',1.))
				#c=list(c)
				#c[3]=.1
				#c=tuple(c)
				#print 'high-level node position',x,vpos[x]
				display_parameters[x]['color']=c
			
	

		width_e=[]
		for x,y in G.edges():
			width_e.append(G[x][y].get('weight',1))
		width_e_norm=[]
		width_e_norm_neg=[]
		max_weight=math.fabs(max(width_e))
		min_weight=math.fabs(min(width_e))
		for w in width_e:
			if w>=0:
				if heatmap:
					#width_e_norm.append(w/max(math.fabs(min(width_e)),max(width_e))/heatmap_scale)
					width_e_norm.append((0.3+(w-min_weight)/(max_weight-min_weight)/heatmap_scale)*scaling_factor)
					
				else:
					#width_e_norm.append(w/max(math.fabs(min(width_e)),max(width_e)))
					width_e_norm.append((0.3+(w-min_weight)/(max_weight-min_weight))*scaling_factor)
				width_e_norm_neg.append(0.)
			else:
				print 'poids negatif',w
				width_e_norm.append(0.)
				width_e_norm_neg.append(1*math.fabs(w)/max(math.fabs(min(width_e)),max(width_e)))
		#print 'width_e_norm',width_e_norm
		if color_edges:	
			edges_colors_list=[]
			for edge in G.edges():
				moyennecolor = meantuple(display_parameters[edge[1]]['color'],display_parameters[edge[0]]['color'])
				edges_colors_list.append(moyennecolor)
		else:
			edges_colors_list='black'
		print '$$$$$$$$$$ before drawing edges ',': ',(time.time()-starttimesub), ' seconds'
		starttimesub= time.time()
	
		nx.draw_networkx_edges(G,vpos,width=width_e_norm,alpha=0.2,edge_color=edges_colors_list,arrows=arrows)
		#nx.draw_networkx_edges(G,vpos,edgelist=[edge],width=width_e_norm_neg,alpha=0.2,color='0.5',style='dotted',arrows=arrows)
		
		print 'edges drawn'
	 	#plt.show()
		labels={}
		labels_tag={}
		for x in G.nodes():
			if not G.node[x]['category']=='tag':
				if G.node[x]['level']=='low':
					if G.node[x]['shape']=='^':# or G.node[x]['category']=='tag':
						labels[x] =easylabel(x.upper(),circles,simplified_label)
					else:
						labels[x] =easylabel(x.lower(),circles,simplified_label)
				else:
					if only_high==True:
						labels[x] =easylabel(x.upper(),circles,simplified_label)
					else:
						labels[x] =''		
				try:
					labels[x]=unicode(labels[x])
				except:
					pass
			else:
				labels_tag[x]=easylabel(x.upper(),circles,simplified_label)
				try:
					labels_tag[x]=unicode(labels_tag[x])
				except:
					pass
			

		font_size=2
		deltavpos=0.003
		if N<600:
			font_size=3
			deltavpos=0.005
			
		if N<400:
			font_size=3
			deltavpos=0.008
		if N<250:
			font_size=4
			deltavpos=0.01

		if N<120:
			font_size=4.25
		
		if N<100:
			font_size=5

		if N<80:
			font_size=6
			deltavpos=0.015
		if N<60:
			font_size=7

		if N<30:
			font_size=8
			deltavpos=0.02
		
		if N>120:
			font_size=5.25*scaling_factor
		if heatmap:
			font_color=	'0.1'
		else:
			font_color=	'0.2'
		if N>=600:
			deltavpos=0.005*scaling_factor*2.5
		print '$$$$$$$$$$ before drawing labels ',': ',(time.time()-starttimesub), ' seconds'
		starttimesub= time.time()
		print 'heatmap in network_layout:',heatmap
		print 'font_size',font_size
		if show_labels:
			if heatmap:
				nx.draw_networkx_labels(G,delta(vpos,deltavpos),labels,font_family='DejaVu Sans',font_size=max(0.5,font_size/heatmap_scale),font_color=font_color)
			else:
				label_adjust=False
				#label_adjust=False
				if label_adjust:
					#names = G.nodes()
					#labels = names
					#print labels
					names=[x for x in labels.values() if x!='']
					
					#print 'labels',labels
					pos_list = np.array([[vpos[x][0] for x in labels if labels[x]!='' ],[vpos[x][1] for x in labels if labels[x]!='']])
					detect_label_positions(names, names, pos_list,font_size=font_size-0.5,font_color=font_color,font_family='DejaVu Sans',deltavpos=deltavpos)
				else:
					nx.draw_networkx_labels(G,delta(vpos,deltavpos),labels,font_family='DejaVu Sans',font_size=font_size-0.5,font_color=font_color)
						
				
				
		if not heatmap:
			for x in vpos: 
				if G.node[x]['category']=='tag':
					alpha  = math.atan((vpos[x][1]-0.5)/(vpos[x][0]-0.5))
					norm=math.sqrt(max(4,int(100*float(G.node[x].get('weight',1.))/float(max(weights_node)))))/530
					if vpos[x][0]<0.5:
						vpos[x][1]= vpos[x][1] - math.sin(alpha)*norm
						vpos[x][0]= vpos[x][0] - math.cos(alpha)*norm
					else:
						vpos[x][1]= vpos[x][1] + math.sin(alpha)*norm
						vpos[x][0]= vpos[x][0] + math.cos(alpha)*norm
					vpos[x][1]=min(vpos[x][1],1.13)
					vpos[x][0]=min(vpos[x][0],1.1)
					vpos[x][1]=max(vpos[x][1],-0.13)
					vpos[x][0]=max(vpos[x][0],-0.1)
			nx.draw_networkx_labels(G,delta(vpos,-0.),labels_tag,font_size=font_size-1,font_family='DejaVu Sans',font_weight='bold',font_color='0.3')
	
		if show==1:
			plt.show()
		title=title.replace('_','-')
		try:
			titlef= projected_entity + ', ' + title
			if not local_y=='':
				titlef= titlef + ' (' + str(local_y)+')'
		except:
			titlef=title
			pass
		plt.title(titlef,fontsize=10,color='grey')
		print 'title',title
	
	
		limits=plt.axis('off')
		print 'filename',filename
		if not local_y=='':
			filenamev=filename.split('.pdf')
			filenamef = filenamev[0] + '(' + str(local_y)+')' + '.pdf'
		else:
			filenamef=filename
	
		print '$$$$$$$$$$ before saving file ',': ',(time.time()-starttimesub), ' seconds'
		starttimesub= time.time()
		while os.path.isfile(filenamef):
			filenamef= filenamef.split('.pdf')[0] + 'x.pdf' 
		plt.savefig(filenamef, orientation='landscape',transparent = True,bbox_inches='tight')
		plt.clf()
		plt.close('all')
		print '$$$$$$$$$$ end of network_layout.plotgraphG ',': ',(time.time()-starttimesub), ' seconds'
	
	#print 'display_parameters',display_parameters
	return display_parameters
#traiter les noedus isolés aussi...			

def filter_above(x,threscram):
	return math.pow(x,1)
	
def plot_heatmap(pos2d,poids,fig,homogeneize):
	#print 'poidsheatmap',poids
	import numpy as np
	import numpy.random
	import matplotlib.pyplot as plt
	import matplotlib
	import numpy as np
	import matplotlib.cm as cm
	import matplotlib.mlab as mlab
	import matplotlib.pyplot as plt
	#step_range=20.
	n=homogeneize[3]
	if homogeneize[0]==True:
		homo=True
		hmin=homogeneize[1]
		hmax=homogeneize[2]
	else:
		homo=False
		#set a max and min to colormap.
	step_range=int(int(math.sqrt(n))*1.5)
	print 'step_range',step_range
	try:
		delta = 1./float(step_range)
	except:
		delta=10
	print 'delta',delta
	data={}
	
	for elem,position in pos2d.iteritems():
		x=int((position[0]+0.16)/1.32*step_range)
		y=int((position[1]+0.16)/1.32*step_range)
		data.setdefault((x,y),[]).append(elem)

	x = np.arange(0, 1, delta)
	y = np.arange(0, 1, delta)

	X, Y = np.meshgrid(x, y)
	threscram=.6
	Z = mlab.bivariate_normal(X, Y, 1., 1., 0.0, 0.0)
	valmin,valmax = 0,0
	for i,ligne in enumerate(Z):
		for j,colonne in enumerate(ligne):
			if not (i,j) in data:
				Z[j][i]=-99999
				
			else:
				val=sum(map(lambda x: filter_above(x,threscram),(map(lambda x:poids.get(x,0),data[(i,j)]))))
				if val>0:
					val=val
				else:
					val=0#not negative correlation yet!!!
				valmin=min(valmin,val)
				valmax = max(val,valmax)
				Z[j][i]=val#max(0.,val)
	#print 'Z',Z
	# for i,ligne in enumerate(Z):
	# 	for j,colonne in enumerate(ligne):
	# 		Z[j][i]=valmax-Z[j][i]
	# i=-1
	# print 'Z',Z
	#plt.figure()
	#cmap=cm.gist_yarg
	#cm.gray
	
	masked_array=np.ma.masked_where(Z==-99999, Z)
	print 'masked_array',masked_array
	#cmap = matplotlib.cm.Blues
	#cmap = matplotlib.cm.gist_yarg
	
	levs = range(12)
	import matplotlib.colors as mcolors

	cmap = mcolors.LinearSegmentedColormap.from_list(name='red_white_blue', colors =[(1, 1., 1), (0, 0, 1)],N=len(levs)-1,)
	#cmap = matplotlib.cm.cool
	#cmap = matplotlib.cm.red_white_blue
	cmap.set_bad('w',1.)
	
	
	#fig = plt.figure()
	fig.patch.set_facecolor('white')
	fig.patch.set_alpha(1)
	
	#im = plt.imshow(Z, origin='lower',cmap=cm.gist_yarg,interpolation='gaussian',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1)
	#plt.imshow(masked_array, interpolation='nearest', cmap=cmap)
	
	#plt.contour(Z, origin='lower',cmap=cmap,interpolation='gaussian',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1)
	#plt.contourf(Z, origin='lower',cmap=cmap,interpolation='gaussian',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1)
	if not homo:
		im = plt.imshow(masked_array, origin='lower',cmap=cmap,interpolation='gaussian',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1)
	else:
		im = plt.imshow(masked_array, origin='lower',cmap=cmap,interpolation='gaussian',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1,vmin = hmin,vmax=hmax)
		
	#plt.quiver(Z, origin='lower', extent=(-0.16,1.16,-0.16,1.16))
	#print 'im',im
	#im = plt.contour(Z, origin='lower',cmap=cm.gist_yarg,interpolation='bilinear',alpha=1,aspect=None,extent=(-0.16,1.16,-0.16,1.16),zorder=-1)
	#print 'im',im
	#matplotlib.rcParams.update({'font.size': 12})
	plt.rcParams.update({'font.size': 5})
	#CBI = plt.colorbar(im, orientation='horizontal', shrink=0.4)
	CBI = plt.colorbar(im, orientation='vertical', shrink=0.4)
	#plt.colorbar(orientation='horizontal', shrink=0.4)
	#plt.show()


def plot_graph_pos(clusters,title,posx = 0,syn=False):

	#on initialise le graphe
	G=nx.Graph()
	stress=[]
	for x,clu in clusters.iteritems():
		if 'dia' in clu:
			for voisin,stre in clu['dia'].iteritems():
				stress.append(stre)
	#print 'max(stress)'
	#print max(stress)
	vpos={}
	strenghts,epaisseurs,labels=[],[],{}
	for x,clu in clusters.iteritems():
		G.add_node(x,weight=clu['epaisseur'])
		if posx==0:
			if 'x' in clu:
				vpos[x] = (clu['x'],clu['y'])
			else:
				vpos[x] = (random.random(),clu['y'])
		else:
			vpos[x] = (posx[x],clu['y'])
				
		labels[x]=''
		epaisseurs.append(clu['epaisseur'])
		if 'dia' in clu:
			for voisin,stre in clu['dia'].iteritems():
				G.add_edge(int(x),int(voisin))
				#if title==0:
				#	strenghts.append(.2)
				#else:
				strenghts.append(stre/max(stress)*2)

		if syn==True:
			if 'syn' in clu:
				for voisin,stre in clu['syn'].iteritems():
					G.add_edge(int(x),int(voisin))
					#if title==0:
					#	strenghts.append(.2)
					#else:
					strenghts.append(stre/max(stress)*2 * 10)
			
	nx.draw_networkx_edges(G,vpos,None,width=strenghts,arrows=arrows)
	nx.draw_networkx_nodes(G,vpos,None,epaisseurs)

#	nx.draw_networkx_edges(G,pos,None,width=forces_plot)
#	nx.draw_networkx_nodes(G,pos,None,epaisseur.values())

 	#plt.show()

	nx.draw_networkx_labels(G,vpos,labels,font_size=10,font_color='blue')
	#print 'labels added'
	#i = random.randint(1,10)
	plt.savefig(path_req + str(title) + '.png')
	plt.close('all')
#traiter les noedus isolés aussi...			


	# print vpos
	# epaisseur = {}
	# periodes=[]
	# vert_pos={}
	# labels={}
	# 
	# for k,row in clusters.iteritems():
	# 	periode=int(row['periode'])
	# 	labels[k] = k
	# 	vpos[k][1]=periode
	# 	if not periode in periodes:
	# 		periodes.append(periode)
	# 	try:
	# 		epaisseur[k] = 4+int(4 * float(row['epaisseur']))
	# 	except:
	# 		epaisseur[k] = 4
	# 	vert_pos[k] = periode
	# #normalisation des épaisseurs:
	# epaisseur_norm={}
	# width_total = sum(epaisseur.values())
	# for k,width in epaisseur.iteritems():
	# 	epaisseur_norm[k] = float(width) / width_total * 1000.
	# epaisseur=epaisseur_norm
	# print 'order'
	# #print G.order()
	# vpos_0 = deepcopy(vpos)
	# 
	# print "computing graph layout"	
	# #print vpos
	# 
	#pos = layout.spring_layout(G,vert_pos,dim=2,pos=None,fixed=None,iterations=500,weighted=True,scale=1)
	# pos = spring_layout_1d(G,periodes,epaisseur,iterations=nb_iterations,dim=2,node_pos=vpos_0)
	# epaisseur_0={}
	# for u,e in epaisseur.iteritems():
	# 	epaisseur_0[u] =np.power(epaisseur[u],1)
	# 
	# for x in G.edges(data=True):
	# 	if x[2]['key']==0:
	# 		G.remove_edge(*x[:2])
	# forces_plot=[]
	# for x in forces:
	# 	forces_plot.append(x*1.4)




def plot_graph_json(liens_totaux_syn,liens_totaux_dia,clusters,label_edges):
	#print clusters
	G,epaisseur,pos = plot_graph(liens_totaux_syn,liens_totaux_dia,clusters)
	steps = 0

	r = {}
	r["meta"] = {}
	r["nodes"] = []
	r["edges"] = []


	r["meta"]["tubes_count"] = len(pos)
	
	for n in pos:
		c = Tube()

		c.i = n
		c.x = float(pos[n][0])
		c.y = float(pos[n][1])
		c.width = int(epaisseur[n])
		try:
			print clusters[n]['label_node']
		except:
			print 'pas de label tube'
		c.label = clusters[n]['label_node']
		
		#c.contain= ? 
		#c.contained_by= ? 
		c.level = 0
		#steps = max(steps, c.y)

		r["nodes"].append(c)

	for edge,edge_label in zip(liens_totaux_dia,label_edges):
		#structure objet
		e= Edge()
		e.node_parent=edge[0]
		e.node_child=edge[1]
		if edge[2]>0.5:
			e.weak=1
		else:
			e.weak=0
		e.label= edge_label
		#e.node_label=?
		#e.weak=1/0
		r["edges"].append(e)
		#r["edges"].append( ( e[0], e[1]) )
	#	r["edges"].append( ( e[0], e[1] ) )

	#r["meta"]["steps"] = int(steps + 1)
	#r["meta"]["start"] = ?
	#r["meta"]["step"] = ?
	#r["meta"]["depth"] = ?
	print jsonpickle.encode(r)