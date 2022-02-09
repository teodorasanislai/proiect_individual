var cal = {
    sMon: true, // luni ca prima zi a saptamanii
    mName: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

    data: null,
    sDay: 0,
    sMth: 0,
    sYear: 0, // dd/mm/yyyy selectata

    hMth: null,
    hYear: null,
    hForm: null,
    hfHead: null,
    hfDate: null,
    hfTxt: null,
    hfDel: null,

    //initializare calendar
    init: () => {
        cal.hMth = document.getElementById("cal-mth");
        cal.hYear = document.getElementById("cal-yr");
        cal.hForm = document.getElementById("cal-event");
        cal.hfHead = document.getElementById("evt-head");
        cal.hfDate = document.getElementById("evt-date");
        cal.hfTxt = document.getElementById("evt-details");
        cal.hfDel = document.getElementById("evt-del");
        document.getElementById("evt-close").onclick = cal.close;
        cal.hfDel.onclick = cal.del;
        cal.hForm.onsubmit = cal.save;

        //data curenta
        let now = new Date(),
            nowMth = now.getMonth(),
            nowYear = parseInt(now.getFullYear());

        //append pentru luni
        for (let i = 0; i < 12; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = cal.mName[i];
            if (i == nowMth) { opt.selected = true; }
            cal.hMth.appendChild(opt);
        }
        cal.hMth.onchange = cal.list;

        // se pot vedea 10 ani inainte si dupa anul curent
        for (let i = nowYear - 10; i <= nowYear + 10; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = i;
            if (i == nowYear) { opt.selected = true; }
            cal.hYear.appendChild(opt);
        }
        cal.hYear.onchange = cal.list;

        cal.list();
    },

    //crearea calendarului pentru luna selectata
    list: () => {
        cal.sMth = parseInt(cal.hMth.value);
        cal.sYear = parseInt(cal.hYear.value);
        let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(),
            startDay = new Date(cal.sYear, cal.sMth, 1).getDay(),
            endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(),
            now = new Date(),
            nowMth = now.getMonth(),
            nowYear = parseInt(now.getFullYear()),
            nowDay = cal.sMth == nowMth && cal.sYear == nowYear ? now.getDate() : null;

        // se salveaza datele in Local Storage ca sa nu se piarda cand inchidem fereastra
        cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
        if (cal.data == null) {
            localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
            cal.data = {};
        } else { cal.data = JSON.parse(cal.data); }

        // crearea patratelelor albe pentru alte luni
        let squares = [];
        if (cal.sMon && startDay != 1) {
            let blanks = startDay == 0 ? 7 : startDay;
            for (let i = 1; i < blanks; i++) { squares.push("b"); }
        }
        if (!cal.sMon && startDay != 0) {
            for (let i = 0; i < startDay; i++) { squares.push("b"); }
        }

        for (let i = 1; i <= daysInMth; i++) { squares.push(i); }

        // patratele albe in zilele din luna anterioara/urmatoare care apar in chenar
        if (cal.sMon && endDay != 0) {
            let blanks = endDay == 6 ? 1 : 7 - endDay;
            for (let i = 0; i < blanks; i++) { squares.push("b"); }
        }
        if (!cal.sMon && endDay != 6) {
            let blanks = endDay == 0 ? 6 : 6 - endDay;
            for (let i = 0; i < blanks; i++) { squares.push("b"); }
        }

        // creaza calendarul HTML

        let container = document.getElementById("cal-container"),
            cTable = document.createElement("table");
        cTable.id = "calendar";
        container.innerHTML = "";
        container.appendChild(cTable);

        // zilele saptamanii
        let cRow = document.createElement("tr"),
            days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
        if (cal.sMon) { days.push(days.shift()); }
        for (let d of days) {
            let cCell = document.createElement("td");
            cCell.innerHTML = d;
            cRow.appendChild(cCell);
        }
        cRow.classList.add("head");
        cTable.appendChild(cRow);

        // zilele dintr-o luna
        let total = squares.length;
        cRow = document.createElement("tr");
        cRow.classList.add("day");
        for (let i = 0; i < total; i++) {
            let cCell = document.createElement("td");
            if (squares[i] == "b") { cCell.classList.add("blank"); } else {
                if (nowDay == squares[i]) { cCell.classList.add("today"); }
                cCell.innerHTML = `<div class="dd">${squares[i]}</div>`;
                if (cal.data[squares[i]]) {
                    cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
                }
                cCell.onclick = () => { cal.show(cCell); };
            }
            cRow.appendChild(cCell);
            if (i != 0 && (i + 1) % 7 == 0) {
                cTable.appendChild(cRow);
                cRow = document.createElement("tr");
                cRow.classList.add("day");
            }
        }

        cal.close();
    },

    // arata casuta add/edit pentru events

    show: (el) => {
        cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
        let isEdit = cal.data[cal.sDay] !== undefined;

        cal.hfTxt.value = isEdit ? cal.data[cal.sDay] : "";
        cal.hfHead.innerHTML = isEdit ? "EDIT EVENT" : "ADD EVENT";
        cal.hfDate.innerHTML = `${cal.sDay} ${cal.mName[cal.sMth]} ${cal.sYear}`;
        if (isEdit) { cal.hfDel.classList.remove("ninja"); } else { cal.hfDel.classList.add("ninja"); }
        cal.hForm.classList.remove("ninja");
    },

    close: () => {
        cal.hForm.classList.add("ninja");
    },

    // save/delete events

    save: () => {
        cal.data[cal.sDay] = cal.hfTxt.value;
        localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
        cal.list();
        return false;
    },

    del: () => {
        if (confirm("Delete event?")) {
            delete cal.data[cal.sDay];
            localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
            cal.list();
        }
    }
};
window.addEventListener("load", cal.init);