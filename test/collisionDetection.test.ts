import {Circle, Square, Triangle, Point, checkCollision} from "../src/index.ts"

test('no collision. circle-circle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Circle();
    b.position = new Point(1.6, 0);
    b.radius = 0.5;

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeFalsy();
});

test('touch. circle-circle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Circle();
    b.position = new Point(1.5, 0);
    b.radius = 0.5;

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('overlap. circle-circle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Circle();
    b.position = new Point(1.2, 0);
    b.radius = 0.5;

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('inside. circle-circle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Circle();
    b.position = new Point(0, 0);
    b.radius = 0.5;

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

//----------------------------------------------------------------------------------------------------------------------

test('no collision. square-square', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Square();
    b.position = new Point(1.6, 0);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeFalsy();
});

test('touch edge. square-square', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Square();
    b.position = new Point(1.5, 0);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('touch vertex. square-square', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Square();
    b.position = new Point(1.5, 1.5);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('overlap. square-square', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Square();
    b.position = new Point(1, 1.2);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('inside. square-square', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Square();
    b.position = new Point(0, 0);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

//----------------------------------------------------------------------------------------------------------------------

test('no collision. triangle-triangle', () => {
    let a = new Triangle();
    a.position = new Point(0, Math.sqrt(3) / 3);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(1.6, Math.sqrt(3) / 6);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeFalsy();
});

test('touch edge. triangle-triangle', () => {
    let a = new Triangle();
    a.position = new Point(0, -Math.sqrt(3) / 3);
    a.edge = 2;
    a.rotation = 180;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('touch vertex. triangle-triangle', () => {
    let a = new Triangle();
    a.position = new Point(0, Math.sqrt(3) / 3);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(2, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('overlap. triangle-triangle', () => {
    let a = new Triangle();
    a.position = new Point(0, -Math.sqrt(3) / 3);
    a.edge = 2;
    a.rotation = 180;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(1.5, 0);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('inside. triangle-triangle', () => {
    let a = new Triangle();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, 0);
    b.edge = 1;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

//----------------------------------------------------------------------------------------------------------------------

test('no collision. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(2, 2);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeFalsy();
});

test('touch edge. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(2, 0);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('touch vertex. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(2, 1);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('overlap. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(1.8, 0.8);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('inside1. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(0, 0);
    b.edge = 3;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('inside2. circle-square', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Square();
    b.position = new Point(0, 0);
    b.edge = 0.5;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

//----------------------------------------------------------------------------------------------------------------------

test('no collision. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Triangle();
    b.position = new Point(2.1, Math.sqrt(3) / 3);
    
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeFalsy();
});

test('touch edge. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Triangle();
    b.position = new Point(0, 1 + Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('touch vertex. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Triangle();
    b.position = new Point(2, Math.sqrt(3) / 3);
    
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('overlap. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Triangle();
    b.position = new Point(1.5, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('inside1. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 1;

    let b = new Triangle();
    b.position = new Point(0, 0);
    b.edge = 5;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

test('inside2. circle-triangle', () => {
    let a = new Circle();
    a.position = new Point(0, 0);
    a.radius = 5;

    let b = new Triangle();
    b.position = new Point(0, 0);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    let [collision, n, p] = checkCollision(a, b);
    expect(collision).toBeTruthy();
});

//----------------------------------------------------------------------------------------------------------------------

test('no collision. square-triangle', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(2.1, 0);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeFalsy();
});

test('touch edge. square-triangle', () => {
    let a = new Square();
    a.position = new Point(0, -1);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('touch vertex. square-triangle', () => {
    let a = new Square();
    a.position = new Point(2, -1);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('overlap. square-triangle', () => {
    let a = new Square();
    a.position = new Point(1.5, -0.8);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, Math.sqrt(3) / 3);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('inside1. square-triangle', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 5;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, 0);
    b.edge = 2;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});

test('inside2. square-triangle', () => {
    let a = new Square();
    a.position = new Point(0, 0);
    a.edge = 2;
    a.rotation = 0;
    a.calculateVertices();

    let b = new Triangle();
    b.position = new Point(0, 0);
    b.edge = 8;
    b.rotation = 0;
    b.calculateVertices();

    console.log(a.vertices)
    console.log(b.vertices)

    let [collision, n, p] = checkCollision(a, b);

    expect(collision).toBeTruthy();
});