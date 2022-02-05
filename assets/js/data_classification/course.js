class Course {
    constructor(courseCode, courseTitle, requirementsText, classRestrictions) {
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.classRestrictions = classRestrictions;

        this.majorRestrictions = "";
        this.lessons = [];

        this.createRequirements(requirementsText);
    }

    createRequirements(requirementsText) {
        //  (MAT 201 MIN DDveya MAT 201E MIN DDveya MAT 210 MIN DDveya MAT 210E MIN DD)ve (EHB 211 MIN DDveya EHB 211E MIN DD)
        //  FIZ 102 MIN DDveya FIZ 102E MIN DDveya EHB 211 MIN DDveya EHB 211E MIN DD
        this._requirementNames = [];

        // If there are no requirements, return an empty list.
        if (requirementsText.includes("Yok")) {
            return;
        }
        else if (requirementsText.includes("planının") || requirementsText.includes("Diğer") || requirementsText.includes("Özel") || requirementsText.includes("için")) {
            // TODO: Implement this.
            return;
        }

        requirementsText = requirementsText
            .replaceAll("veya", "\nveya")
            .replaceAll("ve", "\nve")
            .replaceAll("(", "")
            .replaceAll(")", "");

        var lines = requirementsText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var words = line.split(" ");

            // If this is the first line, then there
            // is no "ve" or "veya" in the line.
            // ex: '(FIZ 101 MIN DD' ...
            if (i == 0) {
                this._requirementNames.push([words[0] + " " + words[1]]);
                continue
            }

            // If the line contains "ve" or "veya".
            // ex: 'veya FIZ 101E MIN DD)'
            // ex2: 've (STA 201 MIN DD'
            let requirementName = words[1] + " " + words[2];
            let logicGate = words[0];

            // Append to the last array.
            if (logicGate == "veya")
                this._requirementNames[this._requirementNames.length - 1].push(requirementName);
            // Create a new array.
            else if (logicGate == "ve")
                this._requirementNames.push([requirementName]);
        }
    }

    connectCourses() {
        this.requirements = [];
        for (let i = 0; i < this._requirementNames.length; i++) {
            this.requirements.push([]);
            for (let j = 0; j < this._requirementNames[i].length; j++) {
                let course = dataManager.findCourseByCode(this._requirementNames[i][j]);
                if (course != null)
                    this.requirements[i].push(course);
            }
        }
    }
}
