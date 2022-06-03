let uploadCases = document.getElementById("uploadCases");

uploadCases.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes("/CaseLogs/CaseEntry/Insert")){
    var file = document.getElementById("file").files[0];
    var reader = new FileReader();
    reader.onload = function(e){
        const text = e.target.result;
        const data = csvToArray(text);
        document.getElementById("caselist").innerHTML="";
        data.forEach((d,i)=>{
            if (i!=0 && d['CaseId']!=""){
            document.getElementById("caselist").innerHTML+=`<li data-year=${document.getElementById("year").value} data-location=${ document.getElementById("location").value} data-id="${d['CaseId']}" data-date="${d['Date']}" data-code1="${d['code1']}" data-code2="${d['code2']}" hidden>Case ${i}</li>`;
            }
        })
        console.log("adding case");
        data1=data[0];
        data1['year']=document.getElementById("year").value;
        data1['location']=document.getElementById("location").value;
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: updateForm,
            args: [data[0]]
            });
    }
    reader.readAsText(file);
}
});

chrome.webNavigation.onCompleted.addListener(function(details) {
    if (details.url.includes("/CaseLogs/CaseEntry/Insert")){
        var caselist=document.getElementById("caselist");
        if(caselist.children.length>0){
            firstchild=caselist.firstChild;
            data = {
                "CaseId": firstchild.dataset.id,
                "Date": firstchild.dataset.date,
                "code1": firstchild.dataset.code1,
                "code2": firstchild.dataset.code2,
                "year": firstchild.dataset.year,
                "location": firstchild.dataset.location
            }
            caselist.removeChild(firstchild);
            document.getElementById("caselist").children
            addCase(data);
        }
    }
})

async function addCase(data){
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("adding case");
     chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: updateForm,
        args: [data]
        });
} 

function updateForm(d) {
    var residentRoles = "121";
    
    document.getElementById("PatientId").value = d['CaseId'];
    document.getElementById("ProcedureDate").value = d['Date'];
    document.getElementById("ProcedureYear").value = d['year'];
    document.getElementById("ResidentRoles").value = residentRoles;
    document.getElementById("Institutions").value = d['location'];
    
    //add item
    document.getElementsByClassName("selectedCodesBody")[0].innerHTML=`
    <li class="warning list-group-item " id="li-code">
    <input class="code-quantity" data-val="true" data-val-required="The Code Qty field is required." id="Quantity" name="Quantity" type="hidden" value="1">
    <input data-val="true" data-val-required="The Code Id field is required." id="CodeId" name="CodeId" type="hidden" value="${d['code1']}">
    <input data-val="true" data-val-required="The Type To Code Id field is required." id="TypeToCodeId" name="TypeToCodeId" type="hidden" value="${d['code2']}">
    <input data-val="true" data-val-required="The Max Qty Allowed field is required." id="MaxQtyAllowed" name="MaxQtyAllowed" type="hidden" value="1">
    <input data-val="true" data-val-required="The Is Qty Edit Allowed field is required." id="IsQtyEditAllowed" name="IsQtyEditAllowed" type="hidden" value="False">
    </li>
    `;
    document.getElementById("submitButton").click();
}

function csvToArray(str, delimiter = ",") {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  
    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
      const values = row.replaceAll('\r', '').split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[header.trim()] = values[index];
        return object;
      }, {});
      return el;
    });
  
    // return the array
    pop = arr.pop()
    return arr;
  }