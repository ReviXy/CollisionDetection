import { METHODS } from "http";

// Чтобы тесты не ругались
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setup);
    document.addEventListener('click', onMouseClick)
}

export class Point{
    x: number;
    y: number;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
}

export enum ShapeType {
    None,
    Circle,
    Square,
    Triangle
}

//----------------------------------------------------------------------------------------------------------------------
// Константы и переменные

const screenSize = new Point(1280, 720);
const shapeCount = 5000;
const quadTreeCapacity = 4;
const pairCheck = false;

const separationMultiplier = 1.2;

const circleRadiusMin = 1.5;
const circleRadiusMax = 2.5;
const squareEdgeMin = 3.0;
const squareEdgeMax = 4.5;
const triangleEdgeMin = 3.0;
const triangleEdgeMax = 4.5;

const speedMin = 1;
const speedMax = 2;
const rotationSpeedMin = -1;
const rotationSpeedMax = 1;

const shapes: Array<CollisionShape> = new Array<CollisionShape>(shapeCount);
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let fps: HTMLHeadElement;
let paused = false;
// Пауза на левую кнопку мыши

//----------------------------------------------------------------------------------------------------------------------
// Основные функции

function setup() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    fps = document.getElementById("FPS") as HTMLHeadElement;
    ctx = canvas!.getContext("2d")!;

    generateShapes()
    run();
}

function generateShapes(){
    for (let i: number = 0; i < shapes.length; i++){
        let newShape: CollisionShape;
        let flag = false;

        while (!flag){
            flag = true;
            const r = Math.random();
            
            if (r < 0.3333) newShape = new Triangle();
            else if (r < 0.6666) newShape = new Square();
            else newShape = new Circle();

            for (let j: number = 0; j < i; j++){
                if (checkCollision(newShape, shapes[j])[0]){
                    flag = false;
                    break;
                }
            }
        }
        shapes[i] = newShape!;
        shapes[i].draw();
    }
}

var requestId = 0;
function run(){
    requestId = window.requestAnimationFrame(run);
    update();
    draw()
}

function onMouseClick(){
    if (paused){
        run()
        paused = false;
    }
    else{
        window.cancelAnimationFrame(requestId);
        paused = true;
    }
}

const frames: Array<number> = [];
let quadTree: QuadTree;
let checkedPairs: Set<string>;

function update(){
    for (let i: number = 0; i < shapes.length; i++){
        const a = shapes[i];
        a.update();
        a.borderCollision();
    }

    quadTree = new QuadTree(new Boundary(0, screenSize.x, 0, screenSize.y));
    for (let i: number = 0; i < shapes.length; i++)
        quadTree.insert(shapes[i]);

    if (pairCheck) checkedPairs = new Set<string>();

    quadTree.checkCollision();

    const curFrame = window.performance.now();
    while (frames.length > 0 && frames[0] <= curFrame - 1000) frames.shift();
    frames.push(curFrame);
    fps.textContent = (frames.length).toFixed(0) + " FPS";
}

function draw(){
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, screenSize.x, screenSize.y);

    shapes.forEach(x => {x.draw()});
}

//----------------------------------------------------------------------------------------------------------------------
// Оптимизация через Quad Tree

class QuadTree{
    shapes: Array<CollisionShape> = [];
    divided: boolean = false;
    boundary: Boundary;

    northWest: QuadTree | null = null;
    northEast: QuadTree | null = null;
    southWest: QuadTree | null = null;
    southEast: QuadTree | null = null;

    constructor(boundary: Boundary){
        this.boundary = boundary;
    }

    insert(shape: CollisionShape): boolean {
        if (!this.boundary.intersects(shape.boundary))
            return false;

        if (!this.divided)
            if (this.shapes.length < quadTreeCapacity){
                this.shapes.push(shape);
                return true;
            } 
            else {
                this.divide();
            }
        
        this.northWest!.insert(shape);
        this.northEast!.insert(shape);
        this.southWest!.insert(shape);
        this.southEast!.insert(shape);
        return true;
    }

    divide(): void {
        const x = (this.boundary.maxX + this.boundary.minX) / 2;
        const y = (this.boundary.maxY + this.boundary.minY) / 2;

        const nw = new Boundary(this.boundary.minX, x, this.boundary.minY, y);
        const ne = new Boundary(x, this.boundary.maxX, this.boundary.minY, y);
        const sw = new Boundary(this.boundary.minX, x, y, this.boundary.maxY);
        const se = new Boundary(x, this.boundary.maxX, y, this.boundary.maxY);

        this.northWest = new QuadTree(nw);
        this.northEast = new QuadTree(ne);
        this.southWest = new QuadTree(sw);
        this.southEast = new QuadTree(se);

        this.shapes.forEach((shape: CollisionShape) => {
            this.northWest!.insert(shape);
            this.northEast!.insert(shape);
            this.southWest!.insert(shape);
            this.southEast!.insert(shape);
        });

        this.shapes = [];
        this.divided = true;
    }

    checkCollision(){
        if (this.divided){
            this.northWest!.checkCollision();
            this.northEast!.checkCollision();
            this.southWest!.checkCollision();
            this.southEast!.checkCollision();
        } else{
            for (let i: number = 0; i < this.shapes.length; i++){
                const a = this.shapes[i];

                for (let j: number = i + 1; j < this.shapes.length; j++){
                    const b = this.shapes[j];

                    if (pairCheck){
                        const pairId: string = Math.min(a.id, b.id) + "_" + Math.max(a.id, b.id);
                        if (checkedPairs.has(pairId)) continue;
                        checkedPairs.add(pairId);
                    }
                    
                    let collision: boolean = false, n: Point, penetration: number;
                    [collision, n, penetration] = checkCollision(a, b);
                    if (collision) resolveCollision(a, b, n, penetration);
                }
            }
        }
    }

}

//----------------------------------------------------------------------------------------------------------------------
// Проверка коллизии

export function checkCollision(a: CollisionShape, b: CollisionShape): [boolean, Point, number] {
    if (a.type == ShapeType.Circle && b.type == ShapeType.Circle)
        return checkCollision_circle_circle(a as Circle, b as Circle);
    else if (a.type == ShapeType.Circle && (b.type == ShapeType.Square || b.type == ShapeType.Triangle))
        return checkCollision_circle_polygon(b as unknown as Polygon, a as Circle);
    else if ((a.type == ShapeType.Square || a.type == ShapeType.Triangle) && b.type == ShapeType.Circle)
        return checkCollision_circle_polygon(a as unknown as Polygon, b as Circle);
    else if ((a.type == ShapeType.Square || a.type == ShapeType.Triangle) && (b.type == ShapeType.Square || b.type == ShapeType.Triangle))
        return checkCollision_polygon_polygon(a as unknown as Polygon, b as unknown as Polygon);

    return [false, new Point(0,0), 0];
}

function checkCollision_circle_circle(a: Circle, b: Circle): [boolean, Point, number]{
    if (distance(a.position, b.position) <= a.radius + b.radius){
        const n = normalize(new Point(a.position.x - b.position.x, a.position.y - b.position.y));
        const penetration = a.radius + b.radius - distance(a.position, b.position);
        return [true, n, penetration];
    }

    return [false, new Point(0,0), 0];
}

function checkCollision_polygon_polygon(a: Polygon, b: Polygon): [boolean, Point, number]{
    const vertices1 = a.vertices;
    const vertices2 = b.vertices;

    const axes = [];

    for (let i: number = 0; i < vertices1.length; i++){
        const edge = new Point(vertices1[(i + 1) % vertices1.length].x - vertices1[i].x, vertices1[(i + 1) % vertices1.length].y - vertices1[i].y);
        const axis = normalize(new Point(-edge.y, edge.x));
        axes.push(axis)
    }

    for (let i: number = 0; i < vertices2.length; i++){
        const edge = new Point(vertices2[(i + 1) % vertices2.length].x - vertices2[i].x, vertices2[(i + 1) % vertices2.length].y - vertices2[i].y);
        const axis = normalize(new Point(-edge.y, edge.x));
        axes.push(axis)
    }

    let minPenetration = Infinity;
    let penetrationNormal = new Point(0, 0);

    for (let i: number = 0; i < axes.length; i++){
        const [min1, max1] = projectPolygon(vertices1, axes[i]);
        const [min2, max2] = projectPolygon(vertices2, axes[i]);

        if (!(max1 >= min2 && max2 >= min1)) return [false, new Point(0,0), 0];

        const penetration = Math.min(max1 - min2, max2 - min1);
        if (penetration < minPenetration){
            minPenetration = penetration;
            penetrationNormal = axes[i];
        }
    }

    return [true, penetrationNormal!, minPenetration];
}

function checkCollision_circle_polygon(polygon: Polygon, circle: Circle): [boolean, Point, number] {
    const vertices = polygon.vertices;
    const axes = [];

    for (let i = 0; i < vertices.length; i++) {
        const edge = new Point(
            vertices[(i + 1) % vertices.length].x - vertices[i].x,
            vertices[(i + 1) % vertices.length].y - vertices[i].y
        );
        const axis = normalize(new Point(-edge.y, edge.x));
        axes.push(axis);
    }

    const closest = findClosestPointOnPolygon(circle.position, vertices);
    const toCircle = new Point(circle.position.x - closest.x, circle.position.y - closest.y);
    const dist = len(toCircle);
    if (dist > 1e-6) {
        axes.push(normalize(toCircle));
    }

    let minPenetration = Infinity;
    let penetrationNormal = new Point(0, 0);

    for (let axis of axes) {
        const [minP, maxP] = projectPolygon(vertices, axis);
        const centerProj = dot(circle.position, axis);
        const minC = centerProj - circle.radius;
        const maxC = centerProj + circle.radius;

        if (maxP < minC || maxC < minP) {
            return [false, new Point(0, 0), 0];
        }

        const penetration = Math.min(maxP, maxC) - Math.max(minP, minC);

        const polyCenter = polygon.position;
        const dirToCircle = new Point(circle.position.x - polyCenter.x, circle.position.y - polyCenter.y);
        const normal = (dot(dirToCircle, axis) >= 0) ? axis : new Point(-axis.x, -axis.y);

        if (penetration < minPenetration) {
            minPenetration = penetration;
            penetrationNormal = normal;
        }
    }

    return [true, penetrationNormal, minPenetration];
}

//----------------------------------------------------------------------------------------------------------------------
// Разрешение коллизии

function resolveCollision(a: CollisionShape, b: CollisionShape, n: Point, penetration: number){
    const v1 = new Point(a.direction.x * a.speed, a.direction.y * a.speed);
    const v2 = new Point(b.direction.x * b.speed, b.direction.y * b.speed);

    const temp1 = new Point(v2.x - v1.x, v2.y - v1.y);
    const temp2 = new Point(v1.x - v2.x, v1.y - v2.y);

    const scalar1 = dot(n, temp1);
    const scalar2 = dot(n, temp2);

    const u1 = new Point(v1.x + n.x * scalar1, v1.y + n.y * scalar1);
    const u2 = new Point(v2.x + n.x * scalar2, v2.y + n.y * scalar2);

    a.speed = len(u1);
    b.speed = len(u2);

    a.direction = normalize(u1);
    b.direction = normalize(u2);

    const ab = new Point(b.position.x - a.position.x, b.position.y - a.position.y);
    const dir = dot(ab, n);
    if (dir < 0) {
        n.x *= -1;
        n.y *= -1;
    }

    a.position.x -= n.x * separationMultiplier * penetration / 2;
    a.position.y -= n.y * separationMultiplier * penetration / 2;
    b.position.x += n.x * separationMultiplier * penetration / 2;
    b.position.y += n.y * separationMultiplier * penetration / 2;
}

//----------------------------------------------------------------------------------------------------------------------
// Вспомогательные функции

function random(min: number, max: number): number{
    return Math.random() * (max - min) + min;
}

function len(point: Point): number{
    return Math.sqrt(point.x * point.x + point.y * point.y);
}

function normalize(point: Point): Point{
    let length = len(point)
    return new Point(point.x / length, point.y / length);
}

function dot(a: Point, b: Point){
    return a.x * b.x + a.y * b.y;
}

function distance(a:Point, b: Point): number{
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function rotate(p: Point, angle: number): Point {
    angle = angle * Math.PI / 180;
    return new Point(p.x * Math.cos(angle) - p.y * Math.sin(angle), p.x * Math.sin(angle) + p.y * Math.cos(angle));
}

function randomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
};

function findClosestPointOnPolygon(point: Point, vertices: Point[]): Point {
    let closestPoint = vertices[0];
    let minDist = distance(point, closestPoint);

    for (let i = 1; i < vertices.length; i++) {
        const dist = distance(point, vertices[i]);
        if (dist < minDist) {
            minDist = dist;
            closestPoint = vertices[i];
        }
    }

    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b = vertices[(i + 1) % vertices.length];
        
        const closestOnEdge = closestPointOnSegment(point, a, b);
        const dist = distance(point, closestOnEdge);
        
        if (dist < minDist) {
            minDist = dist;
            closestPoint = closestOnEdge;
        }
    }
    
    return closestPoint;
}

function closestPointOnSegment(p: Point, a: Point, b: Point): Point {
    const ab = new Point(b.x - a.x, b.y - a.y);
    const ap = new Point(p.x - a.x, p.y - a.y);
    
    const t = Math.max(0, Math.min(1, dot(ap, ab) / dot(ab, ab)));
    
    return new Point(a.x + ab.x * t, a.y + ab.y * t);
}

function projectPolygon(vertices: Array<Point>, axis: Point){
    let minProj = dot(vertices[0], axis);
    let maxProj = minProj;

    for(let i: number = 1; i < vertices.length; i++){
        const proj = dot(vertices[i], axis);
        minProj = Math.min(minProj, proj);
        maxProj = Math.max(maxProj, proj);
    }

    return [minProj, maxProj];
}

//----------------------------------------------------------------------------------------------------------------------
// Классы

class Boundary{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;

    constructor(minX: number, maxX: number, minY: number, maxY: number){
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
    }

    intersects(other: Boundary): boolean{
        return !(other.maxX < this.minX ||
            other.minX > this.maxX ||
            other.maxY < this.minY ||
            other.minY > this.maxY)
    }
}

export abstract class CollisionShape {
    id: number;
    position: Point;
    direction: Point;
    speed: number;
    type: ShapeType;
    color: string;

    boundary: Boundary;
    static nextId: number = 0;

    constructor() {
        this.id = CollisionShape.nextId;
        CollisionShape.nextId += 1;

        this.position = new Point(0, 0);
        this.direction = normalize(new Point(random(-1, 1), random(-1, 1)));
        this.speed = random(speedMin, speedMax);
        this.type = ShapeType.None;
        this.color = randomHexColor();
        this.boundary = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
    }

    update(): void { }

    draw(): void { }

    calculateBoundary(): void { }

    borderCollision(): void { }
}

export class Circle extends CollisionShape {
    radius: number;

    constructor() {
        super()
        this.type = ShapeType.Circle;
        this.radius = random(circleRadiusMin, circleRadiusMax);
        this.position = new Point(random(this.radius * 1.2, screenSize.x - this.radius * 1.2), random(this.radius * 1.2, screenSize.y - this.radius * 1.2));

        this.calculateBoundary();
    }

    update(): void {
        const newX = this.position.x + this.direction.x * this.speed;
        const newY = this.position.y + this.direction.y * this.speed;
        this.position = new Point(newX, newY);

        this.calculateBoundary();
    }

    draw(): void {
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.position.x - this.radius, this.position.y);
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    calculateBoundary(){
        this.boundary = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
        this.boundary.minX = this.position.x - this.radius;
        this.boundary.maxX = this.position.x + this.radius;
        this.boundary.minY = this.position.y - this.radius;
        this.boundary.maxY = this.position.y + this.radius;
    }

    borderCollision(): void {
        if (this.boundary.maxX >= screenSize.x && this.direction.x > 0) this.direction.x *= -1;
        if (this.boundary.minX <= 0 && this.direction.x < 0) this.direction.x *= -1;
        if (this.boundary.maxY >= screenSize.y && this.direction.y > 0) this.direction.y *= -1;
        if (this.boundary.minY <= 0 && this.direction.y < 0) this.direction.y *= -1;
    }
}

export interface Polygon {
    position: Point;
    direction: Point;
    speed: number;

    edge: number;
    vertices: Array<Point>;
    rotation: number;
    rotationSpeed: number;

    calculateVertices(): void;
}

export class Square extends CollisionShape implements Polygon {
    edge: number;
    vertices: Array<Point>;
    rotation: number;
    rotationSpeed: number;

    constructor(){
        super();
        this.type = ShapeType.Square;
        this.edge = random(squareEdgeMin, squareEdgeMax);
        this.rotation = random(0, 360);
        this.rotationSpeed = random(rotationSpeedMin, rotationSpeedMax);
        
        const outerRadius = this.edge * Math.SQRT1_2;
        this.position = new Point(random(outerRadius * 1.2, screenSize.x - outerRadius * 1.2), random(outerRadius * 1.2, screenSize.y - outerRadius * 1.2));

        this.vertices = [];
        this.calculateVertices();
        this.calculateBoundary();
    }

    calculateVertices(){
        this.vertices = [
            rotate(new Point(-this.edge / 2, -this.edge / 2), this.rotation),
            rotate(new Point(-this.edge / 2, this.edge / 2), this.rotation),
            rotate(new Point(this.edge / 2, this.edge / 2), this.rotation),
            rotate(new Point(this.edge / 2, -this.edge / 2), this.rotation),
        ];
        
        this.vertices = this.vertices.map(p => new Point(this.position.x + p.x, this.position.y + p.y))
    }

    update(): void {
        const newX = this.position.x + this.direction.x * this.speed;
        const newY = this.position.y + this.direction.y * this.speed;
        this.position = new Point(newX, newY);

        this.rotation = (this.rotation + this.rotationSpeed) % 360;
        this.calculateVertices();
        this.calculateBoundary();
    }

    draw(): void {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillRect(- this.edge / 2, - this.edge / 2, this.edge, this.edge);

        ctx.restore()
    }

    calculateBoundary(): void {
        this.boundary = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
        this.vertices.forEach((vertex: Point) => {
            if (vertex.x < this.boundary.minX) this.boundary.minX = vertex.x;
            if (vertex.x > this.boundary.maxX) this.boundary.maxX = vertex.x;
            if (vertex.y < this.boundary.minY) this.boundary.minY = vertex.y;
            if (vertex.y > this.boundary.maxY) this.boundary.maxY = vertex.y;
        });
    }

    borderCollision(): void {
        if (this.boundary.maxX >= screenSize.x && this.direction.x > 0) this.direction.x *= -1;
        if (this.boundary.minX <= 0 && this.direction.x < 0) this.direction.x *= -1;
        if (this.boundary.maxY >= screenSize.y && this.direction.y > 0) this.direction.y *= -1;
        if (this.boundary.minY <= 0 && this.direction.y < 0) this.direction.y *= -1;
    }

}

export class Triangle extends CollisionShape implements Polygon {
    edge: number;
    vertices: Array<Point>;
    rotation: number;
    rotationSpeed: number;

    h: number;

    constructor(){
        super();
        this.type = ShapeType.Triangle;
        this.edge = random(triangleEdgeMin, triangleEdgeMax);
        this.h = this.edge * Math.sqrt(3) / 2;
        this.rotation = random(0, 360);
        this.rotationSpeed = random(rotationSpeedMin, rotationSpeedMax);
        
        const outerRadius = this.edge / Math.sqrt(3);
        this.position = new Point(random(outerRadius * 1.2, screenSize.x - outerRadius * 1.2), random(outerRadius * 1.2, screenSize.y - outerRadius * 1.2));

        this.vertices = [];
        this.calculateVertices();
        this.calculateBoundary();
    }

    calculateVertices(){
        this.h = this.edge * Math.sqrt(3) / 2;
        this.vertices = [
            rotate(new Point(0, this.h * 2/3), this.rotation),
            rotate(new Point(-this.edge / 2, -this.h / 3), this.rotation),
            rotate(new Point(this.edge / 2, -this.h / 3), this.rotation),
        ];
        
        this.vertices = this.vertices.map(p => new Point(this.position.x + p.x, this.position.y + p.y))
    }

    update(): void {
        const newX = this.position.x + this.direction.x * this.speed;
        const newY = this.position.y + this.direction.y * this.speed;
        this.position = new Point(newX, newY);

        this.rotation = (this.rotation + this.rotationSpeed) % 360;
        this.calculateVertices();
        this.calculateBoundary();

        this.boundary = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
        this.vertices.forEach((vertex: Point) => {
            if (vertex.x < this.boundary.minX) this.boundary.minX = vertex.x;
            if (vertex.x > this.boundary.maxX) this.boundary.maxX = vertex.x;
            if (vertex.y < this.boundary.minY) this.boundary.minY = vertex.y;
            if (vertex.y > this.boundary.maxY) this.boundary.maxY = vertex.y;
        });
    }

    draw(): void {
        ctx.save();

        ctx.fillStyle = this.color;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        ctx.beginPath();
        ctx.moveTo(0, this.h * 2/3);
        ctx.lineTo(-this.edge / 2, -this.h / 3);
        ctx.lineTo(this.edge / 2, -this.h / 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    calculateBoundary(): void {
        this.boundary = new Boundary(Infinity, -Infinity, Infinity, -Infinity);
        this.vertices.forEach((vertex: Point) => {
            if (vertex.x < this.boundary.minX) this.boundary.minX = vertex.x;
            if (vertex.x > this.boundary.maxX) this.boundary.maxX = vertex.x;
            if (vertex.y < this.boundary.minY) this.boundary.minY = vertex.y;
            if (vertex.y > this.boundary.maxY) this.boundary.maxY = vertex.y;
        });
    }

    borderCollision(): void {
        if (this.boundary.maxX >= screenSize.x && this.direction.x > 0) this.direction.x *= -1;
        if (this.boundary.minX <= 0 && this.direction.x < 0) this.direction.x *= -1;
        if (this.boundary.maxY >= screenSize.y && this.direction.y > 0) this.direction.y *= -1;
        if (this.boundary.minY <= 0 && this.direction.y < 0) this.direction.y *= -1;
    }
}
