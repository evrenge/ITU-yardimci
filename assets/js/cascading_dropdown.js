var subjectObject = {
    "Front-end": {
        "HTML": ["Links", "Images", "Tables", "Lists"],
        "CSS": ["Borders", "Margins", "Backgrounds", "Float"],
        "JavaScript": ["Variables", "Operators", "Functions", "Conditions"]
    },
    "Back-end": {
        "PHP": ["Variables", "Strings", "Arrays"],
        "SQL": ["SELECT", "UPDATE", "DELETE"]
    }
}

window.onload = function () {
    var facultySel = document.getElementById("faculty");
    var programSel = document.getElementById("program");
    var iterationSel = document.getElementById("iteration");
    for (var x in subjectObject) {
        facultySel
        .options[facultySel.options.length] = new Option(x, x);
    }
    facultySel.onchange = function () {
        //empty program- and iteration- dropdowns
        iterationSel.length = 1;
        programSel.length = 1;
        //display correct values
        for (var y in subjectObject[this.value]) {
            programSel.options[programSel.options.length] = new Option(y, y);
        }
    }

    programSel.onchange = function () {
        //empty iteration dropdown
        iterationSel.length = 1;
        //display correct values
        var z = subjectObject[facultySel.value][this.value];
        for (var i = 0; i < z.length; i++) {
            iterationSel.options[iterationSel.options.length] = new Option(z[i], z[i]);
        }
    }
}
