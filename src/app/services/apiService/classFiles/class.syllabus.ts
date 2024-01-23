export class SyllabusModel{
    section_title: string = "";
    section_progress: string = "";
    sectionChildren: Array<SyllabusChildren> = [];
}

export class SyllabusChildren{
    what_item: string = "";
    section_child_title: string = "";
    section_child_duration: string = "";
    is_checked: boolean = false;
    is_currently_selected: boolean = false;
}