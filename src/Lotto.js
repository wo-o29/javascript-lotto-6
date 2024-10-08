import { LOTTO_MESSAGES, LOTTO_NUMBER, LOTTO_PRIZE_MONEY } from "./constants/lotto.js";
import { MissionUtils } from "@woowacourse/mission-utils";

class Lotto {
  #lottoNumbersStore = [];
  #prizeMoney = 0;
  #lottoResult = new Map([
    [3, 0],
    [4, 0],
    [5, 0],
    ["5B", 0],
    [6, 0],
  ]);

  // 유효성 검사
  #isLottoPriceValidate(price) {
    return price % LOTTO_NUMBER.DIVISION_PRICE !== 0;
  }

  #isLottoNumberLengthValidate(numbers) {
    return numbers.length !== LOTTO_NUMBER.LENGTH;
  }

  #isLottoNumberValidate(number) {
    return LOTTO_NUMBER.MIN > number || number > LOTTO_NUMBER.MAX;
  }

  #isDuplicateLottoNumberValidate(numbers) {
    return new Set(numbers).size !== LOTTO_NUMBER.LENGTH;
  }

  // 사용자 입력
  async getUserInputLottoPrice() {
    while (true) {
      try {
        const userInput = await MissionUtils.Console.readLineAsync(LOTTO_MESSAGES.INPUT_LOTTO_PRICE);
        const price = Number(userInput);

        if (this.#isLottoPriceValidate(price)) {
          throw new Error(LOTTO_MESSAGES.INVALID_LOTTO_PRICE);
        }

        return price;
      } catch (error) {
        MissionUtils.Console.print(error.message);
      }
    }
  }

  async getUserInputLottoNumber() {
    while (true) {
      try {
        const userInput = await MissionUtils.Console.readLineAsync(LOTTO_MESSAGES.INPUT_LOTTO_NUMBER);
        const userLottoNumbers = userInput.split(",").map((number) => Number(number));

        if (this.#isLottoNumberLengthValidate(userLottoNumbers)) {
          throw new Error(LOTTO_MESSAGES.SIX_LENGTH_LOTTO_NUMBER);
        }

        if (userLottoNumbers.some((number) => this.#isLottoNumberValidate(number))) {
          throw new Error(LOTTO_MESSAGES.INVALID_LOTTO_NUMBER);
        }

        if (this.#isDuplicateLottoNumberValidate(userLottoNumbers)) {
          throw new Error(LOTTO_MESSAGES.DUPLICATE_LOTTO_NUMBER);
        }

        return userLottoNumbers;
      } catch (error) {
        MissionUtils.Console.print(error.message);
      }
    }
  }

  async getUserInputBonusNumber(userLottoNumbers) {
    while (true) {
      try {
        const userInput = await MissionUtils.Console.readLineAsync(LOTTO_MESSAGES.INPUT_BONUS_NUMBER);
        const bonusNumber = Number(userInput);

        if (this.#isLottoNumberValidate(bonusNumber)) {
          throw new Error(LOTTO_MESSAGES.INVALID_LOTTO_NUMBER);
        }

        if (userLottoNumbers.includes(bonusNumber)) {
          throw new Error(LOTTO_MESSAGES.DUPLICATE_LOTTO_NUMBER);
        }

        return bonusNumber;
      } catch (error) {
        MissionUtils.Console.print(error.message);
      }
    }
  }

  // 로또 번호 생성, 리턴, 출력
  #generateLottoNumbers() {
    const lottoNumbers = MissionUtils.Random.pickUniqueNumbersInRange(
      LOTTO_NUMBER.MIN,
      LOTTO_NUMBER.MAX,
      LOTTO_NUMBER.LENGTH
    );
    return [...lottoNumbers].sort((a, b) => a - b);
  }

  getLottoNumbers(price) {
    const count = price / LOTTO_NUMBER.DIVISION_PRICE;
    MissionUtils.Console.print("\n" + count + LOTTO_MESSAGES.BUY_LOTTO);

    for (let i = 0; i < count; i++) {
      const lottoNumbers = this.#generateLottoNumbers();
      this.#lottoNumbersStore.push(lottoNumbers);
    }

    return this.#lottoNumbersStore;
  }

  printLottoNumbers(lottoNumbersStore) {
    lottoNumbersStore.forEach((numbers) => {
      MissionUtils.Console.print(`[${numbers.join(", ")}]`);
    });
  }

  // 로또 결과 처리, 수익률 구하기, 출력
  getLottoResult(userLottoNumbers, userBonusNumber, lottoNumbersStore) {
    for (const currentNumbers of lottoNumbersStore) {
      const matchCount = userLottoNumbers.filter((number) => currentNumbers.includes(number)).length;

      if (!this.#lottoResult.has(matchCount)) {
        continue;
      }

      if (matchCount === 5 && currentNumbers.includes(userBonusNumber)) {
        this.#lottoResult.set("5B", this.#lottoResult.get("5B") + 1);
        this.#prizeMoney += LOTTO_PRIZE_MONEY["5B"];
        continue;
      }

      this.#lottoResult.set(matchCount, this.#lottoResult.get(matchCount) + 1);
      this.#prizeMoney += LOTTO_PRIZE_MONEY[matchCount];
    }

    return { result: [...this.#lottoResult], prizeMoney: this.#prizeMoney };
  }

  #getRevenueRate(price, prizeMoney) {
    const rate = ((prizeMoney - price) / price) * 100;
    const revenueRate = parseFloat(rate.toFixed(1)).toLocaleString();
    return `총 수익률은 ${revenueRate}%입니다.`;
  }

  printResult(result, price, prizeMoney) {
    MissionUtils.Console.print(LOTTO_MESSAGES.RESULT_LOTTO);

    for (const [key, count] of result) {
      if (key === "5B") {
        MissionUtils.Console.print(`5개 일치, 보너스 일치 (${LOTTO_PRIZE_MONEY[key].toLocaleString()}원) - ${count}개`);
        continue;
      }

      MissionUtils.Console.print(`${key}개 일치 (${LOTTO_PRIZE_MONEY[key].toLocaleString()}원) - ${count}개`);
    }

    MissionUtils.Console.print(this.#getRevenueRate(price, prizeMoney));
  }
}

export default Lotto;
