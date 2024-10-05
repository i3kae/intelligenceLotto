document.getElementById("generateBtn").addEventListener("click", generateLottoNumbers);

function generateLottoNumbers() {
  let numbers = [];
  while (numbers.length < 6) {
    let num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  numbers.sort(function (a, b) {
    return a - b;
  });
  document.getElementById("numbers").innerText = numbers.join(", ");
}
