class Firefly {

    // constructor for firefly with position, color, and size
    constructor(x_init, y_init, orig_color, radius) {

        // position
        this.x = x_init;
        this.y = y_init;
        this.radius = radius;
        this.angle = random(0,360);
        this.max_radius = 20;
        this.min_radius = 5;

        // colors
        this.orig_color = orig_color;
        this.fill_color = this.orig_color;
        this.flicker_color = color("#fbf8a0");

        // movement
        this.base_speed = 1;
        this.speed = this.base_speed;
        this.turn_speed = 0;
        this.turn_speed_update = 0.7;
        this.max_turn_speed = 5;
        this.growth_speed = 0.4;
        this.init_frame = random(0, 1000);

        // glow
        this.glowing = false;

        // clicking
        this.clicked = false;
        this.click_timer = 0;
    }

    draw_glow(light_x, light_y, light_size) {
        if (!this.glowing) {
            return;
        }

        // pulsating glow effect
        let light_pulse = 0.75 + 0.25 * sin(this.init_frame + frameCount * 5);

        blendMode(ADD);
        let c = color(this.flicker_color);
        // layer 4 semi-transparentcircles for glow effect
        for (let i = 1; i <= 4; i++) {
            c.setAlpha(70 / i);
            fill(c);
            circle(light_x, light_y, light_size * (1 + i * 0.9) * light_pulse);
        }
        blendMode(BLEND);
    }

    // render firefly
    show() {
        push();
        // move to position and rotate angle
        translate(this.x, this.y);
        rotate(this.angle + 90);

        // draw body
        noStroke();
        fill("#000000");
        ellipse(0, 0, this.radius, this.radius * 2);

        // draw light
        fill(this.fill_color);
        ellipse(0, this.radius * 0.8, this.radius * 0.6, this.radius * 0.9);

        // draw glow around the light
        this.draw_glow(0, this.radius * 0.8, this.radius * 0.7);

        // draw 4 wings
        fill("#303030");
        for (let wingAngle of [-30, 30]) {
            push();
            rotate(Math.sin(this.init_frame + frameCount * 0.6) * wingAngle);
            ellipse(this.radius, 0, this.radius * 0.9, this.radius * 0.5);
            pop();

            push();
            rotate(180 + Math.sin(this.init_frame + frameCount * 0.6) * wingAngle);
            ellipse(this.radius, 0, this.radius * 0.9, this.radius * 0.5);
            pop();
        }
        pop();
    }

    // update position, orientation, and size
    update(amount) {
        this.change_size(amount * this.growth_speed);
        this.turn(amount * this.turn_speed_update);
        this.move(amount * this.speed);
        this.avoid_edges();
        this.show();

        // click timer
        if (this.clicked) {
            this.click_timer--;
            if (this.click_timer <= 0) {
                this.clicked = false;
            }
        }
    }

    // move forward by random amount
    move(amount) {
        amount = amount * random(0.5, 1.5);
        this.x += amount * cos(this.angle);
        this.y += amount * sin(this.angle);
    }

    // bounce off the canvas edges: reflect the angle along the axis we hit,
    // plus a small random variation, then constrain it so it always points
    // back into the canvas. only bounce if heading out of the canvas.
    avoid_edges() {

        // horizontal bounce
        if (this.x < 0) {
            this.x = 0;
            if (cos(this.angle) < 0) {
                this.angle = constrain(180 - this.angle + random(-15, 15), -80, 80);
            }
        } else if (this.x > width) {
            this.x = width;
            if (cos(this.angle) > 0) {
                this.angle = constrain(180 - this.angle + random(-15, 15), 100, 260);
            }
        }

        // vertical bounce
        if (this.y < 0) {
            this.y = 0;
            if (sin(this.angle) < 0) {
                this.angle = constrain((360 - this.angle + random(-15, 15)) % 360, 10, 170);
            }
        } else if (this.y > height) {
            this.y = height;
            if (sin(this.angle) > 0) {
                this.angle = constrain((540 - this.angle + random(-15, 15)) % 360, 190, 350);
            }
        }
    }

    // turn by random amount, with momentum
    turn(amount) {
        this.turn_speed += random(-amount, amount);
        this.turn_speed *= 0.95;
        this.turn_speed = constrain(this.turn_speed, -this.max_turn_speed, this.max_turn_speed);
        this.angle += this.turn_speed;
        this.angle = (this.angle + 360) % 360;
    }

    // grow or shrink
    change_size(amount) {
        this.radius += random(-amount, amount);
        this.radius = constrain(this.radius, this.min_radius, this.max_radius);
    }

    // highlight and dehighlight the firefly
    highlight() {
        this.fill_color = this.flicker_color;
        this.glowing = true;
        this.speed = this.base_speed * 2;
    }

    dehighlight() {
        this.fill_color = this.orig_color;
        this.glowing = false;
        this.speed = this.base_speed;
    }

    // toggles highlight on and off
    respond(active) {
        if (active) {
            this.highlight();
        } else {
            this.dehighlight();
        }
    }

    // check if point is in firefly
    contains(px, py) {
        let d = dist(px, py, this.x, this.y);
        // to account for wings
        return d < 2 * this.radius;
    }

    is_on_mask(mask) {
        // canvas and video may have different resolutions
        // so we project 
        // camera is flipped, so we flip x to reverse it
        let mask_x = floor(constrain((width - this.x) * mask.width / width, 0, mask.width - 1));
        let mask_y = floor(constrain(this.y * mask.height / height, 0, mask.height - 1));
        let c = mask.get(mask_x, mask_y);
        return c[3] < 128;
    }

    click() {
        this.clicked = true;
        this.click_timer = 30;
    }

}

// child class for bigger firefly
class BigFirefly extends Firefly {

    constructor(x_init, y_init, origColor, radius) {
        super(x_init, y_init, origColor, radius);
        this.max_radius *= 2;
        this.min_radius *= 2;
        this.radius *= 2;
    }

    // render firefly
    show() {
        push();
        // move to position and rotate angle
        translate(this.x, this.y);
        rotate(this.angle + 90);

        // draw a long body
        noStroke();
        fill("#000000");
        let body_half = this.radius * 1.5;
        ellipse(0, 0, this.radius, body_half * 2);

        // draw stripes
        fill("#533d07");
        for (let stripe_y of [-0.7, -0.35, 0]) {
            let y = stripe_y * body_half;
            let w = this.radius * sqrt(1 - sq(y / body_half));
            ellipse(0, y, w, this.radius * 0.15);
        }

        // draw light
        fill(this.fill_color);
        let bulb_y = body_half - this.radius * 0.1;
        circle(0, bulb_y, this.radius * 0.8);
        triangle(-this.radius * 0.4, bulb_y, this.radius * 0.4, bulb_y, 0, bulb_y + this.radius);

        // draw glow around the light
        this.draw_glow(0, bulb_y + this.radius * 0.2, this.radius * 0.9);

        // draw 4 wings
        fill("#303030");
        for (let wingAngle of [-30, 30]) {
            push();
            rotate(Math.sin(this.init_frame + frameCount * 0.6) * wingAngle);
            ellipse(this.radius, 0, this.radius * 0.9, this.radius * 0.5);
            pop();

            push();
            rotate(180 + Math.sin(this.init_frame + frameCount * 0.6) * wingAngle);
            ellipse(this.radius, 0, this.radius * 0.9, this.radius * 0.5);
            pop();
        }
        pop();
    }

}

// create random firefly
// sometimes create big firefly
function create_random_firefly() {
    let x = random(0, width);
    let y = random(0, height);
    let c = color(100, 100, 100);
    let radius = 5;
    let firefly;
    if (random(0, 1.0) < 0.9) {
        firefly = new Firefly(x, y, c, radius);
    } else {
        firefly = new BigFirefly(x, y, c, radius);
    }
    return firefly;
}