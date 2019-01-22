import SimplexNoise from 'simplex-noise'

let simplex = new SimplexNoise()
let noise
let time = 0
let mouse = {
    x: 0,
    y: 0
}
let halfX, halfY
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
let lines = []
let linesNumber = 10
let verticles = 100
let radius = 200
let mfX = 0, mfY = 0
let widthKoef

const canvasContainer = document.getElementsByClassName("canvas")[0];

setSizeCanvas()
canvasContainer.appendChild(canvas)


for (let i = 0; i < linesNumber; i++) {
    lines[i] = []
    for (let j = 0; j <= verticles; j++) {
        let point = {
            x: Math.cos(j / verticles * Math.PI * 2),
            y: Math.sin(j / verticles * Math.PI * 2),
            width: 10
        }
        point._x = point.x
        point._y = point.y
        lines[i].push(point)
    }
}

function update() {

    // Инерция
    mfX += 0.05 * (mouse.x / halfX - mfX)
    mfY += 0.05 * (mouse.y / halfY - mfY)

    for (let i = 0; i < linesNumber; i++) {
        for (let j = 0; j <= verticles; j++) {

            noise = simplex.noise2D(lines[i][j]._x + time * 0.005, lines[i][j]._y + time * 0.005)

            lines[i][j].x = lines[i][j]._x * radius * (1 - i / 20) + noise * radius / 10
            lines[i][j].y = lines[i][j]._y * radius * (1 - i / 20) + noise * radius / 10

            // Смещение
            lines[i][j].x = lines[i][j].x - mfX * radius * i / 20
            lines[i][j].y = lines[i][j].y - mfY * radius * i / 20

            // Изменение толщины линии
            widthKoef = lines[i][j].x * mfX + lines[i][j].y * mfY
            lines[i][j].width = 4 + 4 * widthKoef / radius
        }
    }
}

function render() {
    ctx.strokeStyle = '#00ff00';
    for (let i = 0; i < linesNumber; i++) {
        for (let j = 1; j <= verticles; j++) {
            ctx.beginPath()
            ctx.lineWidth = lines[i][j].width < 1 ? 1 : lines[i][j].width
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.moveTo(halfX + lines[i][j - 1].x, halfY + lines[i][j - 1].y)
            ctx.lineTo(halfX + lines[i][j].x, halfY + lines[i][j].y)
            ctx.stroke()
        }
    }
}

function raf() {
    time++
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    update()
    render()
    requestAnimationFrame(raf)
}

raf()

function onMouseMove(event) {
    mouse.x = event.clientX - halfX
    mouse.y = event.clientY - halfY
}

document.addEventListener('mousemove', onMouseMove)

function setSizeCanvas() {
    if (window.innerWidth < 920) {
        canvas.width = window.innerWidth
        radius = 100
        linesNumber = 6
    } else {
        canvas.width = window.innerWidth / 2
        radius = 200
        linesNumber = 10
    }
    canvas.height = window.innerHeight
    halfX = canvas.width / 2
    halfY = canvas.height / 2
}

window.onresize = (event) => {
    setSizeCanvas()
}
