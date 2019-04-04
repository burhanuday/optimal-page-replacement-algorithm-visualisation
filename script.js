function sleep() {
    return new Promise(resolve => setTimeout(resolve, 10));
}

const search = function (key, frame) {
    for (let i = 0; i < frame.length; i++) {
        if (frame[i] == key) {
            return true;
        }
    }
    return false;
}

const getPositionOfHit = function (key, frame) {
    for (let i = 0; i < frame.length; i++) {
        if (frame[i] == key) {
            return i;
        }
    }
    return -1;
}

const predict = function (page, frame, pageNumber, index) {
    let res = -1;
    let farthest = index;
    for (let i = 0; i < frame.length; i++) {
        let j;
        for (j = index; j < pageNumber; j++) {
            if (frame[i] == page[j]) {
                if (j > farthest) {
                    farthest = j;
                    res = i;
                }
                break;
            }
        }

        if (j == pageNumber)
            return i;
    }

    return (res == -1) ? 0 : res;
}

const optimalPage = function (page, pageNumber, frameNumber) {
    let frame = [];
    let hit = 0;

    for (let i = 0; i < pageNumber; i++) {
        if (search(page[i], frame)) {
            hit++;
            continue;
        }

        if (frame.length < frameNumber) {
            frame.push(page[i]);
        } else {
            let j = predict(page, frame, pageNumber, i + 1);
            frame[j] = page[i];
        }
    }

    return hit;
}


const animate = async function (page, pageNumber, frameNumber) {
    window.scrollTo(0, document.body.scrollHeight);
    let frame = [];
    let hit = 0;

    for (let i = 0; i < pageNumber; i++) {
        for (let x = 0; x < frame.length; x++) {
            let cell = rows[x + 1].cells[i];
            cell.innerHTML = frame[x];
            await sleep();
        }
        if (search(page[i], frame)) {
            hit++;
            let cell = rows[fn + 1].cells[i + 1];
            cell.innerHTML = "<b>*</b>";

            let position = getPositionOfHit(page[i], frame);
            if (position !== -1) {
                let cell = table.rows[0].cells[i+1];
                cell.style.color = "#6ab04c";
                
                cell = table.rows[position+1].cells[i+1];
                cell.style.backgroundColor = "#6ab04c";
                cell.style.color = "white";
            }
            await sleep();
            continue;
        }else{
            let cell = table.rows[0].cells[i+1];
            cell.style.color = "#eb4d4b";
        }

        if (frame.length < frameNumber) {
            frame.push(page[i]);
        } else {
            let j = predict(page, frame, pageNumber, i + 1);
            frame[j] = page[i];
            let cell = rows[j + 1].cells[i];
            cell.style.backgroundColor = "#eb4d4b";
            cell.style.color = "white";

            cell = rows[j + 1].cells[i+1];
            cell.style.backgroundColor = "#eb4d4b";
            cell.style.color = "white";
        }
    }

    for (let x = 0; x < frame.length; x++) {
        let cell = rows[x + 1].cells[pageNumber];
        cell.innerHTML = frame[x];
        await sleep();
    }
}

let table = document.getElementById("animated-table");
let rows = [];
let fn = 0;

document.getElementById("input-form").addEventListener('submit', function (e) {
    e.preventDefault();

    table.innerHTML = "";
    let inputString = document.getElementById("inputString").value;
    fn = document.getElementById("inputFrames").value;
    fn = parseInt(fn);

    //20304230327207507570
    let pg = inputString.split("");
    //let pg = [2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 7, 2, 0, 7, 5, 0, 7, 5, 7, 0];
    //fn = 4;
    let pn = pg.length;

    for (let i = 0; i < fn + 2; i++) {
        rows[i] = table.insertRow(i);
        for (let j = 0; j < pn + 1; j++) {
            rows[i].insertCell(j);
        }
        if (i !== 0 && i !== fn + 1)
            rows[i].cells[0].innerHTML = `<b>${i}</b>`;
    }

    for (let i = 1; i <= pn; i++) {
        rows[0].cells[i].innerHTML = `<b>${pg[i - 1]}</b>`
    }


    let hits = optimalPage(pg, pn, fn);
    animate(pg, pn, fn);

    document.getElementById("outputHits").innerText = "Page hits: " + hits;
    document.getElementById("outputMisses").innerText = "Page misses: " + (pn - hits);
})