

function updatePosition(circleNumber) {

    const x =
        document.getElementById(
            `circle${circleNumber}-x`
        ).value;


    const y =
        document.getElementById(
            `circle${circleNumber}-y`
        ).value;


    const circle =
        document.getElementById(
            `circle${circleNumber}`
        );


    circle.style.left = `${x}px`;

    circle.style.top = `${y}px`;

}


function updateSize(circleNumber) {

    const size =
        document.getElementById(
            `circle${circleNumber}-size`
        ).value;


    const circle =
        document.getElementById(
            `circle${circleNumber}`
        );


    circle.style.width =
        `${size}px`;


    circle.style.height =
        `${size}px`;

}


function updateSkew(circleNumber) {

    const skewX =
        document.getElementById(
            `circle${circleNumber}-skewX`
        ).value;


    const skewY =
        document.getElementById(
            `circle${circleNumber}-skewY`
        ).value;


    const circle =
        document.getElementById(
            `circle${circleNumber}`
        );


    circle.style.transform =
        `skew(${skewX}deg, ${skewY}deg)`;

}


function connectCircle(circleNumber) {


    /* X POSITION */

    document.getElementById(
        `circle${circleNumber}-x`
    ).addEventListener(
        "input",
        function() {

            updatePosition(circleNumber);

        }
    );


    /* Y POSITION */

    document.getElementById(
        `circle${circleNumber}-y`
    ).addEventListener(
        "input",
        function() {

            updatePosition(circleNumber);

        }
    );


    /* SIZE */

    document.getElementById(
        `circle${circleNumber}-size`
    ).addEventListener(
        "input",
        function() {

            updateSize(circleNumber);

        }
    );


    /* SKEW X */

    document.getElementById(
        `circle${circleNumber}-skewX`
    ).addEventListener(
        "input",
        function() {

            updateSkew(circleNumber);

        }
    );


    /* SKEW Y */

    document.getElementById(
        `circle${circleNumber}-skewY`
    ).addEventListener(
        "input",
        function() {

            updateSkew(circleNumber);

        }
    );


    /* INITIAL POSITION */

    updatePosition(circleNumber);


    /* INITIAL SIZE */

    updateSize(circleNumber);


    /* INITIAL SKEW */

    updateSkew(circleNumber);

}


for (
    let circleNumber = 1;
    circleNumber <= 4;
    circleNumber++
) {
document.getElementById(`circle${circleNumber}-color`).addEventListener("input", function() {
    updateColor(circleNumber);
});
    connectCircle(circleNumber);

}
function updateColor(circleNumber) {
    const colorInput = document.getElementById(`circle${circleNumber}-color`);
    const circle = document.getElementById(`circle${circleNumber}`);
    const dot = document.getElementById(`circle${circleNumber}-dot`);

    let color = colorInput.value;

    // Add # if the user leaves it out
    if (!color.startsWith("#")) {
        color = "#" + color;
    }


    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        circle.style.backgroundColor = color;
        dot.style.backgroundColor = color;
    }
}