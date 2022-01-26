class DataManager{
    LESSON_PATH = "../../data/lesson_rows.txt";
    CLASS_PATH = "../../data/course_plans.txt";

    constructor(){
        this.initialisedFiles = false;
    }

    readData(){
        this.readLessons();
        this.readCoursePlans();
    }

//    readLessons(){
//    var fr = new FileReader();
//        
//    }

}

