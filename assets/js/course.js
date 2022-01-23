class Course {
    constructor(courseCode, requirementsText) {
        this.courseCode = courseCode;
        this.createRequirements(requirementsText);
    }

    createRequirements(requirementsText) {
        this.requirementNames = [];

        // If there are no requirements, return an empty list.
        if (requirementsText == "<td>Yok/None</td>") {
            return;
        }

        // Example of an un-filtered requirementsText:
        // '<td> (FIZ 101 MIN DD<br>veya FIZ 101E MIN DD)<br>ve (STA 201 MIN DD<br>veya STA 201E MIN DD<br>veya MAK 118 MIN DD<br>veya MAK 118E MIN DD)<br></td>'

        // Get rid of table rows.
        requirementsText = requirementsText.replaceAll("<td> ", "").replaceAll("</td>", "");
        // Get rid of paranthesis.
        requirementsText = requirementsText.replaceAll("(", "").replaceAll(")", "")

        // Seperate lines.
        let lines = requirementsText.split("<br>");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const words = line.split(" ");

            // If this is the first line, then there
            // is no "ve" or "veya" in the line.
            // ex: '(FIZ 101 MIN DD'
            if (i == 0) {
                this.requirementNames.push([words[0] + " " + words[1]]);
                continue
            }

            // If the line contains "ve" or "veya".
            // ex: 'veya FIZ 101E MIN DD)'
            // ex2: 've (STA 201 MIN DD'
            let requirementName = words[1] + " " + words[2];
            let logicGate = words[0];

            // Append to the last array.
            if (logicGate == "veya")
                this.requirementNames[this.requirementNames.length - 1].push(requirementName);
            // Create a new array.
            else if (logicGate == "ve")
                this.requirementNames.push([requirementName]);
        }
    }
}