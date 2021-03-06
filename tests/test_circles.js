function createNav(){
    Nav.init(rd);
    Nav.addButton(
        'Mode: AddCircle',
        "Modes.setMode('addCircle')"
        );
    Nav.addButton(
        'Mode: SelectCircle',
        "Modes.setMode('selectCircle')"
        );
    Nav.draw();
}

module("Raphael Test", {
    setup: function(){
        _.invoke([Nav, R(), Circles, Dots, Connectors, Events],
            'clear');
        Events.listenForArrows(function(key, evt){
            key === "up" && log("Up Key");
            key === "down" && log("Down Key");
            evt.preventDefault();
        });
        Circles.init({ r: r, rd: rd });
        createNav();
    },
    teardown: function(){
        Events.clear();
    }
});

test("Circles", function(){
    var c = Circles.Circle({
        xy: [450, 50],
        rad: 10
    });
    ok(c !== undefined, "new circle is not undefined");
    equal(Circles.list().length, 1, "Circles.list() returns one circle.");
    equal(Circles.selectedCircles().length, 0, "No circle is marked as selected yet.");
    c.select();
    equal($(Circles.selectedCircles()).get(0)._id, c._id, "The circle is selected.");
});

test("Grid Points", function(){
    equal(Circles.list().length, 0, "No circles");
    var circle = Circles.Circle({
        xy: [50, 50],
        rad: 50
    });
    var dotCount = 0;
    (function addGridDots(x0, y0, xmax, ymax, spacing){
        var l = [];
        for(var x = x0; x <= xmax; x+= spacing) {
            for(var y = y0; y <= ymax; y+= spacing) {
                l.push([ x, y ]);
                dotCount++;
            }
        }
        Dots.makeDots.apply(this, l);
    })(0, 0, 100, 100, 10);

    var dotsInC2 = Dots.inCircle(circle);
    _.each(dotsInC2, function(dot, i, dots){
        dot.style = "covered";
        dot.update();
    });

    equal(dotCount, Dots.list().length, "There are the right number of dots being displayed.");
    equal(81, circle.containedDots().length, "There are 81 dots in the sample circle");
});

test("Random Points", function(){
    var l = [];
    function randUnder(n) { return Math.floor(Math.random()*n); }
    _(20).times(function(){
        l.push([ randUnder(600), randUnder(200) ]);
    });
    Dots.makeDots.apply(this, l);
});

test("Connect Circles", function(){
    var circles = [
        Circles.Circle({ xy: [20, 20], rad: 10 }),
        Circles.Circle({ xy: [60, 20], rad: 10 })
    ];
    var connector = Connectors.join(circles);
    equal(40, connector.distance, "The distance was properly calculated to 40");
    equal(0, Dots.list().length, "Zero dots exist at the moment");
    Dots.makeDots([20, 13], [60, 27]);
    equal(2, Dots.list().length, "Two dots exist at the moment");
    equal(1, Dots.inCircle(circles[0]).length, "This circle overlaps with one dot.");
    equal(1, circles[0].connectedCircles().length, "Circle.connectedCircles() returns one sibling.");
    equal(2, Dots.inGrid(circles[0]).length, "This grid overlaps with two dots.");
});

test("Circles with styles", function(){
    Circles.Circle({
        xy: [40, 40],
        rad: 10,
        style: 'c1',
        text: 'C1'
    });
    Circles.Circle({
        xy: [120, 40],
        rad: 10,
        style: 'c2',
        text: 'C2'
    });
    Circles.Circle({
        xy: [120, 70],
        rad: 10,
        style: 'c2',
        text: 'C2'
    });
});

module("Math Tests", {});
test("Dot Circle Placement", function(){
    function testInSimpleCircleCoords(dx, dy, shouldBe) {
        // offsets x and y
        var ox = 2, oy = 1;
        var cc = [10 + ox, 10 + oy];
        // "Point [x, y] should be in circle [cx, cy, radius]"
        equals(shouldBe, Circles._inCircleCoords(10 + ox, 10 + oy, 10, dx + ox, dy + oy),
            "Point ["+ (dx + ox) +", "+ (dy + oy) +"] should " +
                (shouldBe === false ? "NOT " : "") +
                "be in the circle [" + cc[0] + ", " + cc[1] + ", 10]");
    }
    // the should-be-true values are on the border of the simple circle.
    // the should-be-false values are outside of the circle.
    testInSimpleCircleCoords(16, 2, true);
    testInSimpleCircleCoords(16, 1.9, false);
    testInSimpleCircleCoords(16, 18, true);
    testInSimpleCircleCoords(16, 18.1, false);
    testInSimpleCircleCoords(4, 18, true);
    testInSimpleCircleCoords(4, 18.1, false);
    testInSimpleCircleCoords(4, 2, true);
    testInSimpleCircleCoords(4, 1.9, false);
});

test("Costs", function(){
    var c = Circles.Circle({ xy: [20, 20], rad: 10, draw: false });
    equal(123, Costs.circleCost(c), "Circle cost starts out as 123");
    equal(undefined, Costs.gridCost(c), "Because circle is alone, grid cost is undefined.");

    var cpair = [
        Circles.Circle({ xy: [20, 20], rad: 10, draw: false }),
        Circles.Circle({ xy: [50, 20], rad: 10, draw: false })
    ];
    var connector = Connectors.join(cpair);
    equal(30, connector.distance, "The distance was properly calculated");
    ok(cpair[0].isGrid(), "Connected circles are listed as a grid");
    ok(cpair[1].isGrid(), "Connected circles are listed as a grid");
    equal(undefined, Costs.circleCost(cpair[0]));
    equal(123, Costs.gridCost(cpair[0]));
});

module("Modes", {});
test("Modes", function(){
    equal(Modes.getMode(), undefined, "No mode is set");
    Modes.setMode('addCircle');
    equal(Modes.getMode(), 'addCircle', "Mode is properly set");
});