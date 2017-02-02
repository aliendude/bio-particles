var Particle = function () {
	this.id = particle_id_counter;
	particle_id_counter +=1;
	this.name = "Particle";
	this.x = 100;
	this.y = 100;
	this.size = 10;
	this.mass = 10;
	this.vel = [1,1];
	this.color = 0xFFFFFF;
	//percentage of speed lost in each frame:
	this.friction = 0;
	//percentage of velocity conserved in a bounce:
	this.elasticity = 0.4;
	this.interactions = [{name:"repel", interacts_with: "Particle", direction: -1, range: 10*this.size, force:10}];
};

Particle.prototype.drawCircl = function(graphics){
	// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
	graphics.lineStyle(0);
	graphics.beginFill(this.color, 0.6);
	graphics.drawCircle(this.x, this.y, this.size);
	graphics.endFill();

};

Particle.prototype.drawRect = function(graphics){
	// draw a circle, set the lineStyle to zero so the circle doesn't have an outline
	graphics.lineStyle(0);
	graphics.beginFill(this.color, 0.6);
	graphics.drawRect(this.x, this.y, this.size*1.5, this.size*1.5)
	graphics.endFill();

};
Particle.prototype.move = function(canvas_size_x, canvas_size_y){

	//apply velocity:
	this.x += this.vel[0];
	this.y += this.vel[1];
	//apply friction:
	if (this.vel[0] != 0) this.vel[0] -= this.vel[0]*this.friction;
	if (this.vel[1] != 0) this.vel[1] -= this.vel[1]*this.friction;

	//borders 
	//TO DO: fix this:
	//bounce:
	//if(this.x + this.size > canvas_size_x || this.x - this.size < 0) this.vel[0] =  -this.vel[0];
	//if(this.y + this.size > canvas_size_y || this.y - this.size < 0) this.vel[1] =  -this.vel[1];
	
	//sphere:
	//have in mind that interactions break in borders using this:
	if(this.x > canvas_size_x) this.x = 0;
	if(this.y > canvas_size_y) this.y = 0;
	if(this.x < 0) this.x =  canvas_size_x;
	if(this.y < 0) this.y =  canvas_size_y;
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
					if(distance_boundaries < 0){
						//console.log("collision");
						this.elasticBounce(other_particles[j]);
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