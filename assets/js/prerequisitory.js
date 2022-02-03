prereqGrapher = undefined;

function getFormValues(name) {
    var getValue = document.getElementById(name).selectedOptions[0].value;
    return getValue;
}

function graphPrerequistoryGraph() {
    $("#prerequisitoryChains").show();
    stickyNavBar();

    if (prereqGrapher != undefined) {
        prereqGrapher.graph.destroy();
    }

    let semesters = dataManager.semesters[getFormValues("faculty")][getFormValues("program")][getFormValues("iteration")];
    prereqGrapher = new PrerequisitoryGrapher(semesters);

    prereqGrapher.createGraph(() => {
        let parent = document.getElementById("mountNode");
        let width = parent.clientWidth * 0.9;
        let size = [width, prereqGrapher.calculateSemesterHeight(width) * 8];

        parent.clientHeight = size[1];

        return size;
    });
    prereqGrapher.graph.render();
    document.getElementById("navbar").scrollIntoView({ behavior: "smooth" });
    document.getElementById("currentStepText").innerHTML = texts[0];
}

texts = ["Aldığın Dersleri Seç", "Almak İstediğin Dersleri Seç"];

function nextStep() {
    let currentStepText = document.getElementById("currentStepText");
    if (prereqGrapher == undefined) {
        return;
    } else if (prereqGrapher.graphMode == 0) {
        prereqGrapher.switchGraphMode(1);
        document.getElementById("previousStep").disabled = false;
        currentStepText.innerHTML = texts[1];
    } else if (prereqGrapher.graphMode == 1) {
        location.href = "#CoursePlanCreator";
    }
}

function previousStep() {
    let currentStepText = document.getElementById("currentStepText");
    if (prereqGrapher == undefined) {
        return;
    } else if (prereqGrapher.graphMode == 1) {
        prereqGrapher.switchGraphMode(0);
        document.getElementById("previousStep").disabled = true;
        currentStepText.innerHTML = texts[0];
    }
}