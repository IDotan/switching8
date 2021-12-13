let animation_time = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jumpover-time').replace('s', '')) * 1000;
let in_move = false;
let enable_input = true;
const HISTORY = [];

/**
 * Switch the 2 given cubes in animaition and DOM position.
 * 
 * @param {HTMLElement} first_cube cube to switch
 * @param {HTMLElement} secend_cube cube to switch
 * @param {Boolean} horizontal true when the game is showing horizontaly
 * @param {HTMLElement} double center cube to switch around, null when the cubes are next to each other
 */
function cube_switch(first_cube, secend_cube, horizontal, double = null) {
    /**
     * Set the position affected values for the animaition according to the game display rotation.
     */
    function set_position_affected_vals() {
        if (horizontal) {
            pos_offset = (switch_rect['left'] - clicked_rect['right']) / 2;
        } else {
            pos_offset = (switch_rect['top'] - clicked_rect['bottom']) / 2;
            rotate_x = '--animation-x-offset';
            rotate_y = '--animation-y-offset';
            rotate_x_counter = '--animation-x-offset-counter';
            rotate_y_counter = '--animation-y-offset-counter';
        };
    };

    /**
     * Calculate and set the animaition css values.
     */
    function set_css_vals() {
        document.documentElement.style.setProperty(rotate_x, (width / 2) + 'px');
        document.documentElement.style.setProperty(rotate_y, (pos_offset + width) + 'px');
        document.documentElement.style.setProperty(rotate_x_counter, (width / 2) + 'px');
        document.documentElement.style.setProperty(rotate_y_counter, ((pos_offset * (-1)) + 'px'));
    };

    /**
     * Add the animaition classes to the cubes, remove the animaition classes and switch DOM position at the end of the animition.
     */
    function switch_implementation() {
        first_cube.classList.add('switch');
        secend_cube.classList.add('switch_counter');
        setTimeout(() => {
            first_cube.classList.remove('switch');
            secend_cube.classList.remove('switch_counter');
            if (!double) {
                secend_cube.insertAdjacentElement('afterend', first_cube);
            } else {
                double.insertAdjacentElement('afterend', first_cube);
                double.insertAdjacentElement('beforebegin', secend_cube);
            };
            in_move = false;
        }, animation_time);
    }

    let clicked_rect = first_cube.getBoundingClientRect();
    let width = clicked_rect['width'];
    let switch_rect = secend_cube.getBoundingClientRect();
    let pos_offset;
    let rotate_x = '--animation-y-offset';
    let rotate_y = '--animation-x-offset';
    let rotate_x_counter = '--animation-y-offset-counter';
    let rotate_y_counter = '--animation-x-offset-counter';
    set_position_affected_vals();
    set_css_vals();
    switch_implementation();
};

/**
 * Undo the latest action in HISTORY.
 */
function undo() {
    let action = HISTORY.pop();
    action[1] == 'afterend' ? cube_switch_setup(action[0], 'beforebegin', true) : cube_switch_setup(action[0], 'afterend', true);
};

/**
 * Click handeler for the undo button.
 */
function undo_click_handeler() {
    if ((HISTORY.length == 0) || in_move || !enable_input) { return };
    enable_input = false;
    undo();
    setTimeout(() => { enable_input = true }, animation_time);
};

/**
 * Rest the cubes to starting position one action at a time.
 */
function rest() {
    /**
     * Recursion function to go over all the history steps.
     */
    function reset_recursion() {
        if (HISTORY.length == 0) {
            document.documentElement.style.setProperty('--jumpover-time', (normal_speed / 1000 + 's'));
            animation_time = normal_speed;
            enable_input = true;
            return;
        };
        if (in_move) {
            setTimeout(reset_recursion, 100);
        } else {
            undo();
            setTimeout(() => {
                reset_recursion();
            }, animation_time);
        };
    };

    if (!enable_input || (HISTORY.length == 0) || in_move) { return; };
    enable_input = false;
    const normal_speed = animation_time;
    document.documentElement.style.setProperty('--jumpover-time', '0.2s');
    animation_time = 200;
    reset_recursion();
};

/**
 * Set up the needed values for the switch and call the swiching function.
 * 
 * @param {HTMLElement} cube the clicked cube.
 * @param {String} direction afterend || beforebegin for what action to take.
 * @param {boolean} redo true when its a redo to not save to HISTORY, default false
 */
function cube_switch_setup(cube, direction, redo = false) {
    /**
     * Call the switching function with the correct values according to the clicked cube.
     */
    function start_switching() {
        if (next != null && next.className == "space") {
            in_move = true;
            if (direction == 'afterend') {
                cube_switch(cube, next, horizontal);
            } else {
                cube_switch(next, cube, horizontal);
            };
        } else if (next_next != null && (next_next.className == "space")) {
            in_move = true;
            if (direction == 'afterend') {
                cube_switch(cube, next_next, horizontal, next);
            } else {
                cube_switch(next_next, cube, horizontal, next);
            };
        };
    };

    if (in_move) { return };
    let next = cube.nextElementSibling;
    let next_next;
    if (next) { next_next = next.nextElementSibling };
    let horizontal = false;
    if (direction == 'beforebegin') {
        next = cube.previousElementSibling;
        next_next = null;
        if (next) { next_next = next.previousElementSibling; };
    };

    if (window.innerWidth >= window.innerHeight) {
        horizontal = true;
    };
    if (!redo) { HISTORY.push([cube, direction]) };
    start_switching();
};

/**
 * Create and add the game cube div to the game continer.
 */
function add_cubes() {
    /**
     * Create game cube div's according to the given values.
     * 
     * @param {String} class_name className to give to the div.
     * @param {Number} times numbers of div's to create.
     * @param {String} event_action afterend || beforebegin for the event listener, null to not add listener.
     */
    function create(class_name, times, event_action = null) {
        for (let i = 0; i < times; i++) {
            let div = document.createElement('DIV');
            div.classList = class_name;
            if (event_action) {
                div.addEventListener('click', (event) => {
                    if (enable_input) { cube_switch_setup(event.target, event_action); };
                });
            };
            continer.appendChild(div);
        };
    };
    let continer = document.getElementById('game_continer');
    create('space red', 4, 'afterend');
    create('space', 1);
    create('space blue', 4, 'beforebegin');
};

add_cubes();

document.getElementById('undo_btn').addEventListener('click', () => { if (enable_input) { undo_click_handeler() }; });
document.getElementById('reset_btn').addEventListener('click', () => { if (enable_input) { rest() }; });
['info_btn', 'close_wraper'].forEach((btn) => { document.getElementById(btn).addEventListener('click', () => { document.getElementById('info').classList.toggle('close') }); });
window.addEventListener('keydown', (e) => { if (e.code == 'Escape') { document.getElementById('info').classList.add('close') } });