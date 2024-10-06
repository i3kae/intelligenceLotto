document.getElementById("generateButton").addEventListener("click", () => generateLottoNumbers("mostFrequent"));
document.getElementById("generateInverseButton").addEventListener("click", () => generateLottoNumbers("leastFrequent"));
document.getElementById("generatePredictedButton").addEventListener("click", () => generateLottoNumbers("predicted"));

let numberFrequencies = {};
let weightedNumberFrequencies = {};
let totalOccurrences = 0;
let totalWeightedOccurrences = 0;

let dataLoaded = false;

// URL에서 데이터 가져오기
fetch("data.csv")
  .then((response) => response.text())
  .then((data) => {
    parseCSV(data);
    dataLoaded = true;
  })
  .catch((error) => {
    console.error("데이터를 가져오는 중 오류 발생:", error);
  });

function parseCSV(data) {
  const lines = data.split("\n");
  const N = lines.length;
  const decayFactor = 0.98; // 필요에 따라 조정 가능 (0 < decayFactor < 1)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue; // 빈 줄 건너뛰기
    const columns = line.split("\t")[0].split(","); // 탭으로 구분된 값
    if (columns.length < 7) continue; // 충분한 열이 있는지 확인
    const numbers = columns.slice(1, 7).map(Number); // 번호1부터 번호6까지
    const drawIndex = i - 1; // i는 1부터 시작
    const weight = Math.pow(decayFactor, N - drawIndex); // 최근 회차일수록 가중치 증가
    numbers.forEach((num) => {
      // 가중치 없는 빈도 계산
      if (numberFrequencies[num]) {
        numberFrequencies[num]++;
      } else {
        numberFrequencies[num] = 1;
      }
      totalOccurrences++;

      // 가중치 있는 빈도 계산
      if (weightedNumberFrequencies[num]) {
        weightedNumberFrequencies[num] += weight;
      } else {
        weightedNumberFrequencies[num] = weight;
      }
      totalWeightedOccurrences += weight;
    });
  }
  console.log("번호 빈도:", numberFrequencies);
  console.log("가중치 번호 빈도:", weightedNumberFrequencies);
}

function generateLottoNumbers(method) {
  if (!dataLoaded) {
    alert("데이터가 아직 로드되지 않았습니다.");
    return;
  }

  let weights = [];

  if (method === "mostFrequent") {
    // 빈도에 비례한 가중치 계산
    for (let i = 1; i <= 45; i++) {
      const frequency = numberFrequencies[i] || 0;
      weights[i] = frequency / totalOccurrences;
    }
  } else if (method === "leastFrequent") {
    // 역가중치 계산
    const frequencies = [];
    for (let i = 1; i <= 45; i++) {
      frequencies[i] = numberFrequencies[i] || 0;
    }
    const maxFrequency = Math.max(...frequencies.slice(1)); // 인덱스 0 제외
    let totalInverseFrequency = 0;
    for (let i = 1; i <= 45; i++) {
      const frequency = frequencies[i];
      const inverseFrequency = maxFrequency - frequency + 1; // 0 가중치 방지를 위해 +1
      weights[i] = inverseFrequency;
      totalInverseFrequency += inverseFrequency;
    }
    // 가중치 정규화
    for (let i = 1; i <= 45; i++) {
      weights[i] = weights[i] / totalInverseFrequency;
    }
  } else if (method === "predicted") {
    // 가중치 빈도에 비례한 가중치 계산
    for (let i = 1; i <= 45; i++) {
      const frequency = weightedNumberFrequencies[i] || 0;
      weights[i] = frequency / totalWeightedOccurrences;
    }
  } else {
    alert("알 수 없는 방법입니다.");
    return;
  }

  // 가중치를 사용하여 번호 생성
  const selectedNumbers = [];
  while (selectedNumbers.length < 6) {
    const num = getRandomWeightedNumber(weights);
    if (!selectedNumbers.includes(num)) {
      selectedNumbers.push(num);
    }
  }

  // 결과 표시
  displayResult(selectedNumbers, method);
}

function getRandomWeightedNumber(weights) {
  let sum = 0;
  const cumulativeWeights = [];
  for (let i = 1; i < weights.length; i++) {
    sum += weights[i];
    cumulativeWeights[i] = sum;
  }
  const random = Math.random() * sum;
  for (let i = 1; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      return i;
    }
  }
  return 45; // 예외 처리
}

function displayResult(numbers, method) {
  const resultsDiv = document.getElementById("results");
  const resultItem = document.createElement("div");
  resultItem.className = "result-item";

  const title = document.createElement("h4");
  if (method === "mostFrequent") {
    title.textContent = "가장 많이 나온 번호로 생성된 로또 번호";
  } else if (method === "leastFrequent") {
    title.textContent = "가장 적게 나온 번호로 생성된 로또 번호";
  } else if (method === "predicted") {
    title.textContent = "랜덤 번호로 생성된 로또 번호";
  }

  const numbersDiv = document.createElement("div");
  numbersDiv.className = "numbers";
  numbers.sort((a, b) => a - b);
  numbers.forEach((num) => {
    const numberSpan = document.createElement("span");
    numberSpan.className = "number";
    numberSpan.textContent = num;

    if (num >= 1 && num <= 10) {
      numberSpan.classList.add("yellow");
    } else if (num >= 11 && num <= 20) {
      numberSpan.classList.add("blue");
    } else if (num >= 21 && num <= 30) {
      numberSpan.classList.add("red");
    } else if (num >= 31 && num <= 40) {
      numberSpan.classList.add("gray");
    } else if (num >= 41 && num <= 45) {
      numberSpan.classList.add("green");
    }

    numbersDiv.appendChild(numberSpan);
  });

  resultItem.appendChild(title);
  resultItem.appendChild(numbersDiv);

  // 애니메이션 효과 추가
  resultItem.classList.add("fade-in");
  resultsDiv.prepend(resultItem); // 맨 위에 추가

  // 애니메이션 클래스 제거
  setTimeout(() => {
    resultItem.classList.remove("fade-in");
  }, 1000);
}
