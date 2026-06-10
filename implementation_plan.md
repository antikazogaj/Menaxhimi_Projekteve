# Plani i Zbatimit: Gantt, Burndown dhe Rich Text Editor

Ky është plani i plotë për të implementuar të tre këto kërkesa profesionale njëkohësisht.

## 1. Ndryshimet në Databazë (Backend)
Për të bërë grafikët Gantt dhe Burndown të funksionojnë saktësisht, duhet të shtojmë disa kolona në tabelën `tasks`:
- `data_fillimit` (DATE): Për të ditur saktësisht kur fillon një detyrë, që Gantt Chart të mos ketë vetëm një datë (data_afatit), por një shtrirje kohore.
- `depends_on_task_id` (INT): Për të krijuar varësi (Task B pret Task A).
- `completed_at` (DATETIME): Për të ditur saktësisht kur përfundon një detyrë, që Burndown Chart të mund të vizatojë historikun e mbylljes së detyrave ditë pas dite.

## 2. Rich Text Editor (React Quill)
- Do të instalojmë bibliotekën `react-quill` në frontend.
- Do të zëvendësojmë `<textarea>` të thjeshtë në modalet e Krijimit (`AddTask.js`) dhe Përditësimit të detyrës me komponentin `<ReactQuill>`.
- Databaza (`pershkrimi` si TEXT) e mbështet tashmë ruajtjen e HTML-së që prodhon Quill, kështu që s'kemi nevojë ta ndryshojmë strukturën aty, vetëm anën vizuale.

## 3. Gantt Chart / Timeline View
- Do të instalojmë bibliotekën `frappe-gantt` ose një librari të ngjashme moderne (`gantt-task-react`).
- Do të krijojmë një Tab të ri (p.sh. pranë "Board") të quajtur "Timeline" brenda detajeve të projektit.
- Në këtë pamje, detyrat do të shfaqen si shirita kohorë bazuar në `data_fillimit` dhe `data_afatit`. Do të vizatojmë gjithashtu shigjeta për varësitë (`depends_on_task_id`).

## 4. Burndown Chart
- Do të krijojmë një endpoint në Backend `/api/sprints/:id/burndown` që gjeneron të dhënat: numrin total të detyrave ditën e parë të Sprintit, dhe rënien (mbylljen e tyre) bazuar në datat e `completed_at`.
- Do ta vizatojmë këtë në Frontend duke përdorur `react-chartjs-2` (një grafik Line Chart me dy vija: Vijën Ideale dhe Vijën Reale).
- Ky grafik do të shfaqet në një dritare të re brenda "Sprints" ose "Raportet".

> [!IMPORTANT]
> ## User Review Required
> 1. Për të aplikuar këto ndryshime do më duhet të bëj ndryshime në strukturën e databazës (shtimin e 3 kolonave). A jeni dakord?
> 2. Për Editorin "Rich Text" do të përdor `react-quill`, që është standardi i industrisë për tekste me bold, lista, links, etj.
> 
> Nëse jeni dakord me këtë plan, më thoni dhe do të filloj me ekzekutimin e Kodit dhe Ndryshimeve në Backend menjëherë!
