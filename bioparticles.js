var Particle = function (stage) {
	this.id = particle_id_counter;
	particle_id_counter +=1;

	this.stage = stage;
	//the graphic object
	this.graphics = new PIXI.Graphics();
	this.stage.addChild(this.graphics);
	
	//text
	this.printLabel = false;
	var style = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 10,
	});
	this.label = new PIXI.Text(this.id.toString(), style);

	this.name = "Particle";
	this.x = 100;
	this.y = 100;
	this.size = 10;
	this.mass = 10;
	this.vel = [1,1];
	this.color = 0xFFFFFF;
	//percentage of speed lost in each frame:
	this.friction = 0.0;
	//percentage of velocity conserved in a bounce:
	this.elasticity = 0.4;
	this.interactions = [{name:"repel", interacts_with: "Particle", direction: -1, range: 10*this.size, force:10}];
};

Particle.prototype.setPrintLabel = function(printLabel){
	if(printLabel) {
		this.printLabel = true;
		this.stage.addChild(this.label);
	} else {
		this.printLabel = false;
		this.stage.removeChild(this.label);
	}
}

Particle.prototype.drawCircl = function(){
	this.graphics.clear();
	// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
	this.graphics.lineStyle(0);
	this.graphics.beginFill(this.color, 0.6);
	this.graphics.drawCircle(this.x, this.y, this.size);
	this.graphics.endFill();
};

Particle.prototype.draw = function(){
	this.drawCircl();
	if(this.printLabel){
		//text
		this.label.text = this.id.toString();
		this.label.x = this.x;
		this.label.y = this.y;
	}
};

Particle.prototype.drawRect = function(){
	this.graphics.clear();
	// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
	this.graphics.lineStyle(0);
	this.graphics.beginFill(this.color, 0.6);
	this.graphics.drawRect(this.x, this.y, this.size*2, this.size*2)
	this.graphics.endFill();

}

Particle.prototype.borderBounce = function(){
	//bounce:
	var border_bounce_energy = 1.5; 
	if(this.x + this.size > canvas_size_x ) this.vel[0] -= this.mass * border_bounce_energy;
	if(this.x - this.size < 0) this.vel[0] +=  this.mass * border_bounce_energy;
	if(this.y + this.size > canvas_size_y ) this.vel[1] -=  this.mass * border_bounce_energy;
	if(this.y - this.size < 0) this.vel[1] +=  this.mass * border_bounce_energy;	
}

Particle.prototype.borderSphere = function(){
	//sphere:
	//have in mind that interactions break in borders using this:
	if(this.x > canvas_size_x) this.x = 0;
	if(this.y > canvas_size_y) this.y = 0;
	if(this.x < 0) this.x =  canvas_size_x;
	if(this.y < 0) this.y =  canvas_size_y;
}

Particle.prototype.borderInteraction = function(){
	this.borderBounce();
}
Particle.prototype.move = function(canvas_size_x, canvas_size_y){


	//apply velocity:
	this.x += this.vel[0];
	this.y += this.vel[1];
	//apply friction:
	if (this.vel[0] != 0) this.vel[0] -= this.vel[0]*this.friction;
	if (this.vel[1] != 0) this.vel[1] -= this.vel[1]*this.friction;

	//borders 
	this.borderInteraction();

};

Particle.prototype.getDistanceBoundaries = function(p){
	var distance = Math.sqrt(Math.pow(p.x -this.x,2)+Math.pow(p.y - this.y,2));
	//remove the particle size from the distance
	distance -= (this.size + p.size);
	return distance;
};

Particle.prototype.getDistanceCenter = function(p){
	var distance = Math.sqrt(Math.pow(p.x -this.x,2)+Math.pow(p.y - this.y,2));
	//console.log(distance);
	return distance;
};

Particle.prototype.elasticBounce = function(p2) {
	//ellastic newtonian collision
	var dx = this.x-p2.x;
	var dy = this.y-p2.y;
	var collisionision_angle = Math.atan2(dy, dx);
	var magnitude_1 = Math.sqrt(this.vel[0]*this.vel[0]+this.vel[1]*this.vel[1]);
	var magnitude_2 = Math.sqrt(p2.vel[0]*p2.vel[0]+p2.vel[1]*p2.vel[1]);
	var direction_1 = Math.atan2(this.vel[1], this.vel[0]);
	var direction_2 = Math.atan2(p2.vel[1], p2.vel[0]);
	var new_xspeed_1 = magnitude_1*Math.cos(direction_1-collisionision_angle);
	var new_yspeed_1 = magnitude_1*Math.sin(direction_1-collisionision_angle);
	var new_xspeed_2 = magnitude_2*Math.cos(direction_2-collisionision_angle);
	var new_yspeed_2 = magnitude_2*Math.sin(direction_2-collisionision_angle);
	var final_xspeed_1 = ((this.mass-p2.mass)*new_xspeed_1+(p2.mass+p2.mass)*new_xspeed_2)/(this.mass+p2.mass);
	var final_xspeed_2 = ((this.mass+this.mass)*new_xspeed_1+(p2.mass-this.mass)*new_xspeed_2)/(this.mass+p2.mass);
	var final_yspeed_1 = new_yspeed_1;
	var final_yspeed_2 = new_yspeed_2;
	this.vel[0] = this.elasticity*(Math.cos(collisionision_angle)*final_xspeed_1+Math.cos(collisionision_angle+Math.PI/2)*final_yspeed_1);
	this.vel[1] = this.elasticity*(Math.sin(collisionision_angle)*final_xspeed_1+Math.sin(collisionision_angle+Math.PI/2)*final_yspeed_1);
	p2.vel[0] = p2.elasticity*(Math.cos(collisionision_angle)*final_xspeed_2+Math.cos(collisionision_angle+Math.PI/2)*final_yspeed_2);
	p2.vel[1] = p2.elasticity*(Math.sin(collisionision_angle)*final_xspeed_2+Math.sin(collisionision_angle+Math.PI/2)*final_yspeed_2);
}

Particle.prototype.processCollisions = function(other_particles) {
	for (var j = 0; j < other_particles.length; j++)
	{
		if(this.id != other_particles[j].id)
		{
			//check all interactions
			for (var l = 0; l < this.interactions.length; l++)
			{
				//compare particle names to see if there's an interaction
				if(this.interactions[l].interacts_with == other_particles[j].name){
					
					var distance_boundaries = this.getDistanceBoundaries(other_particles[j]);
					var distance_center = this.getDistanceCenter(other_particles[j]);
					//if is colliding and is repeling the other particle 
					if(distance_boundaries < 0 ){
						if(this.interactions[l].direction < 0){
							//console.log("collision");
							this.elasticBounce(other_particles[j]);
						} else {
							//do the bounce but also push the force
							this.elasticBounce(other_particles[j]);

							var force = this.interactions[l].direction * this.interactions[l].force * this.mass*other_particles[j].mass / Math.pow(distance_center, 2);
							var dir = [(other_particles[j].x - this.x)/distance_center, (other_particles[j].y- this.y)/distance_center];
							other_particles[j].vel[0]+=force * dir[0];
							other_particles[j].vel[1]+=force * dir[1];
						}
					}
					else if( distance_center < this.interactions[l].range )
					{
						//in range or interaction
						//based on newton's gravitation law
						var force = this.interactions[l].direction * this.interactions[l].force * this.mass*other_particles[j].mass / Math.pow(distance_center, 2);
						//get the direction normalized
						var dir = [(other_particles[j].x - this.x)/distance_center, (other_particles[j].y- this.y)/distance_center];
						other_particles[j].vel[0]+=force * dir[0];
						other_particles[j].vel[1]+=force * dir[1];
					}
				}
				
			}
		}
	}
}
Particle.prototype.toString = function () {
	return this.id
}


function Graph(stage) {
	this.stage = stage;
  //the graphic object
  this.graphics = new PIXI.Graphics();
  this.stage.addChild(this.graphics);

  this.vertices = [];
  this.edges = [];
  this.numberOfEdges = 0;
}

Graph.prototype.draw = function(vertex) {
	this.graphics.clear();
	for (var u =0; u < this.vertices.length; u++)
	{	
		//iterate over edges of vertex:
		for(var v = 0; v < this.edges[this.vertices[u]].length; v++)
		{
			//console.log("drawww");
			// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
			this.graphics.lineStyle(1);
			this.graphics.beginFill(0x000000);
			this.graphics.moveTo(this.vertices[u].x, this.vertices[u].y);
			this.graphics.lineTo(this.edges[this.vertices[u]][v].x, this.edges[this.vertices[u]][v].y);
			this.graphics.endFill();
			
		}
	}
};


Graph.prototype.addGraph = function(graph) {
	for (var u =0; u < graph.vertices.length; u++)
	{
		//if is not in the graph already:
		if( this.vertices.indexOf(graph.vertices[u]) == -1) {
			this.vertices.push(graph.vertices[u]);
		}
		this.edges[graph.vertices[u]] =  graph.edges[graph.vertices[u]];
	}
}

//not used yet:
Graph.prototype.removeVertices = function(v2) {
	for (var i = 0; i < this.edges[v2].length; i++) {

		this.removeVertex(this.edges[v2][i]);
	}
	this.removeVertex(v2);
}

Graph.prototype.addVertex = function(vertex) {
	this.vertices.push(vertex);
	this.edges[vertex] = [];
};
Graph.prototype.removeVertex = function(vertex) {
	var index = this.vertices.indexOf(vertex);
	if(~index) {
		this.vertices.splice(index, 1);
	}
	while(this.edges[vertex].length) {
		var adjacentVertex = this.edges[vertex].pop();
		this.removeEdge(adjacentVertex, vertex);
	}
};
Graph.prototype.addEdge = function(vertex1, vertex2) {
	this.edges[vertex1].push(vertex2);
	this.edges[vertex2].push(vertex1);
	this.numberOfEdges++;
};
Graph.prototype.removeEdge = function(vertex1, vertex2) {
	var index1 = this.edges[vertex1] ? this.edges[vertex1].indexOf(vertex2) : -1;
	var index2 = this.edges[vertex2] ? this.edges[vertex2].indexOf(vertex1) : -1;
	if(~index1) {
		this.edges[vertex1].splice(index1, 1);
		this.numberOfEdges--;
	}
	if(~index2) {
		this.edges[vertex2].splice(index2, 1);
	}
};
Graph.prototype.size = function() {
	return this.vertices.length;
};
Graph.prototype.relations = function() {
	return this.numberOfEdges;
};
Graph.prototype.traverseDFS = function(vertex, fn) {
	if(!~this.vertices.indexOf(vertex)) {
		return console.log('Vertex not found');
	}
	var visited = [];
	this._traverseDFS(vertex, visited, fn);
};
Graph.prototype._traverseDFS = function(vertex, visited, fn) {
	visited[vertex] = true;
	if(this.edges[vertex] !== undefined) {
		fn(vertex);
	}
	for(var i = 0; i < this.edges[vertex].length; i++) {
		if(!visited[this.edges[vertex][i]]) {
			this._traverseDFS(this.edges[vertex][i], visited, fn);
		}
	}
};
Graph.prototype.traverseBFS = function(vertex, fn) {
	if(!~this.vertices.indexOf(vertex)) {
		return console.log('Vertex not found');
	}
	var queue = [];
	queue.push(vertex);
	var visited = [];
	visited[vertex] = true;

	while(queue.length) {
		vertex = queue.shift();
		fn(vertex);
		for(var i = 0; i < this.edges[vertex].length; i++) {
			if(!visited[this.edges[vertex][i]]) {
				visited[this.edges[vertex][i]] = true;
				queue.push(this.edges[vertex][i]);
			}
		}
	}
};
Graph.prototype.pathFromTo = function(vertexSource, vertexDestination) {
	if(!~this.vertices.indexOf(vertexSource)) {
		return console.log('Vertex not found');
	}
	var queue = [];
	queue.push(vertexSource);
	var visited = [];
	visited[vertexSource] = true;
	var paths = [];

	while(queue.length) {
		var vertex = queue.shift();
		for(var i = 0; i < this.edges[vertex].length; i++) {
			if(!visited[this.edges[vertex][i]]) {
				visited[this.edges[vertex][i]] = true;
				queue.push(this.edges[vertex][i]);
        // save paths between vertices
        paths[this.edges[vertex][i]] = vertex;
    }
}
}
if(!visited[vertexDestination]) {
	return undefined;
}

var path = [];
for(var j = vertexDestination; j != vertexSource; j = paths[j]) {
	path.push(j);
}
path.push(j);
return path.reverse().join('-');
};
Graph.prototype.print = function() {
	console.log(this.vertices.map(function(vertex) {
		return (vertex + ' -> ' + this.edges[vertex].join(', ')).trim();
	}, this).join(' | '));
};
