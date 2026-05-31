const API_URL =
"https://script.google.com/macros/s/AKfycbyLUSSz5GyHvYnU7VlhJEr5-QHnuxwz90iH2aWnz8Sz3urNRo-ElqLgqrns1RTC7yRoxw/exec";

let allData = [];

let summaryChart = null;
let cashflowChart = null;
let detailChart = null;

function rupiah(angka){

return new Intl.NumberFormat(
'id-ID',
{
style:'currency',
currency:'IDR',
maximumFractionDigits:0
}
).format(angka || 0);

}

function showPage(pageId){

document
.querySelectorAll('.page')
.forEach(page => {

page.classList.remove('active');

});

document
.getElementById(pageId)
.classList.add('active');

}

fetch(API_URL)

.then(res => res.json())

.then(data => {

allData = data;

loadFilterOptions(data);

renderDashboard(data);

setupFilters();

setupSearch();

})

.catch(err => {

console.error(err);

alert(
"Gagal mengambil data dari Google Sheet"
);

});

function loadFilterOptions(data){

const tahunFilter =
document.getElementById(
"tahunFilter"
);

const kategoriFilter =
document.getElementById(
"kategoriFilter"
);

const tahunSet =
new Set();

const kategoriSet =
new Set();

data.forEach(item=>{

if(item.tanggal){

const tahun =
new Date(item.tanggal)
.getFullYear();

tahunSet.add(tahun);

}

if(item.kategori){

kategoriSet.add(
item.kategori
);

}

});

[...tahunSet]
.sort()
.forEach(tahun=>{

tahunFilter.innerHTML +=
`<option value="${tahun}">
${tahun}

</option>`;

});

[...kategoriSet]
.sort()
.forEach(kategori=>{

kategoriFilter.innerHTML +=
`<option value="${kategori}">
${kategori}

</option>`;

});

}

function setupFilters(){

document
.getElementById("bulanFilter")
.addEventListener(
"change",
applyFilters
);

document
.getElementById("tahunFilter")
.addEventListener(
"change",
applyFilters
);

document
.getElementById("kategoriFilter")
.addEventListener(
"change",
applyFilters
);

}

function applyFilters(){

const bulan =
document
.getElementById("bulanFilter")
.value;

const tahun =
document
.getElementById("tahunFilter")
.value;

const kategori =
document
.getElementById("kategoriFilter")
.value;

let filtered =
[...allData];

if(bulan !== "ALL"){

filtered =
filtered.filter(
item =>
item.bulan === bulan
);

}

if(tahun !== "ALL"){

filtered =
filtered.filter(item=>{

const t =
new Date(item.tanggal)
.getFullYear();

return String(t)
=== tahun;

});

}

if(kategori !== "ALL"){

filtered =
filtered.filter(
item =>
item.kategori === kategori
);

}

renderDashboard(
filtered
);

}

function renderDashboard(data){

let pendapatan = 0;
let pengeluaran = 0;
let laba = 0;
let piutang = 0;
let hutang = 0;
let hpp = 0;

data.forEach(item=>{

pendapatan +=
Number(item.masuk)||0;

pengeluaran +=
Number(item.keluar)||0;

laba +=
Number(item.laba)||0;

piutang +=
Number(item.piutang)||0;

hutang +=
Number(item.hutang)||0;

hpp +=
Number(item.hpp)||0;

});

document.getElementById(
"pendapatan"
).innerText =
rupiah(pendapatan);

document.getElementById(
"pengeluaran"
).innerText =
rupiah(pengeluaran);

document.getElementById(
"laba"
).innerText =
rupiah(laba);

document.getElementById(
"saldo"
).innerText =
rupiah(
pendapatan -
pengeluaran
);

document.getElementById(
"piutangCard"
).innerText =
rupiah(piutang);

document.getElementById(
"hutangCard"
).innerText =
rupiah(hutang);

document.getElementById(
"lrPendapatan"
).innerText =
rupiah(pendapatan);

document.getElementById(
"lrHpp"
).innerText =
rupiah(hpp);

document.getElementById(
"lrLaba"
).innerText =
rupiah(laba);

document.getElementById(
"totalPiutang"
).innerText =
rupiah(piutang);

document.getElementById(
"totalHutang"
).innerText =
rupiah(hutang);

renderTable(data);

renderSummaryChart(
pendapatan,
pengeluaran,
laba
);

renderCashflowChart(
data
);

}

function renderTable(data){

const tbody =
document.getElementById(
"allTransaksi"
);

tbody.innerHTML = "";

[...data]
.reverse()
.forEach(item=>{

tbody.innerHTML += `

<tr>
<td>${item.bulan}</td>
<td>${formatTanggal(item.tanggal)}</td>
<td>${item.kategori}</td>
<td>${item.aktivitas}</td>
<td>${rupiah(item.invoice)}</td>
</tr>
`;

});

}

function renderSummaryChart(
pendapatan,
pengeluaran,
laba
){

if(summaryChart){

summaryChart.destroy();

}

summaryChart =
new Chart(

document
.getElementById(
"chartSummary"
),

{

type:'bar',

data:{

labels:[
'Pendapatan',
'Pengeluaran',
'Laba'
],

datasets:[{

data:[
pendapatan,
pengeluaran,
laba
]

}]

}

});

}

function renderCashflowChart(
data
){

const bulanMap = {};

data.forEach(item=>{

if(!bulanMap[item.bulan]){

bulanMap[item.bulan]=0;

}

bulanMap[item.bulan]+=
Number(item.masuk)||0;

});

const labels =
Object.keys(
bulanMap
);

const values =
Object.values(
bulanMap
);

if(cashflowChart){

cashflowChart.destroy();

}

cashflowChart =
new Chart(

document
.getElementById(
"chartCashflow"
),

{

type:'line',

data:{

labels:labels,

datasets:[{

label:
'Cashflow',

data:values,

fill:false

}]

}

});

const detail =
document
.getElementById(
"cashflowDetail"
);

if(detail){

if(detailChart){

detailChart.destroy();

}

detailChart =
new Chart(detail,{

type:'bar',

data:{

labels:labels,

datasets:[{

label:
'Pendapatan Bulanan',

data:values

}]

}

});

}

}

function setupSearch(){

const search =
document
.getElementById(
"search"
);

if(!search) return;

search.addEventListener(
"keyup",

function(){

const keyword =
this.value
.toLowerCase();

const rows =
document.querySelectorAll(
"#allTransaksi tr"
);

rows.forEach(row=>{

const text =
row.innerText
.toLowerCase();

row.style.display =
text.includes(keyword)
? ""
: "none";

});

});

}

function exportExcel(){

let csv =
"Bulan,Tanggal,Kategori,Aktivitas,Invoice\n";

allData.forEach(item=>{

csv +=
`${item.bulan},${formatTanggal(item.tanggal)},${item.kategori},${item.aktivitas},${item.invoice}\n`;

});

const blob =
new Blob(
[csv],
{
type:
'text/csv;charset=utf-8;'
}
);

const link =
document
.createElement(
'a'
);

link.href =
URL.createObjectURL(
blob
);

link.download =
'laporan_wijaya.csv';

link.click();

}

function formatTanggal(tanggal){

if(!tanggal)
return "-";

return new Date(
tanggal
).toLocaleDateString(
'id-ID'
);

}
