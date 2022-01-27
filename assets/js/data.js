data = new DataManager();

function FacultyOptionList(){
    var option = document.createElement("option");
    option.text = "Text";
    option.value = [];
    var select = document.getElementById("faculty");
    select.appendChild(option);
}

function ProgramOptionList(){
    var option = document.createElement("option");
    option.text = "Text";
    option.value = [];
    var select = document.getElementById("program");
    select.appendChild(option);
}

function IterationOptionList(){
    var option = document.createElement("option");
    option.text = "Text";
    option.value = [];
    var select = document.getElementById("iteration");
    select.appendChild(option);
}