export default async function RetirementCalculator() {
  // Calculate the future value of the current savings and the future value of the annuity (monthly contributions)
  function calculateFutureSavings(
    currentSavings: number,
    monthlyContribution: number,
    currentAge: number,
    retirementAge: number,
    annualReturn: number,
    annualIncomeIncrease: number,
  ) {
    const monthlyReturn = annualReturn / 12 / 100;
    let futureSavings =
      currentSavings *
      Math.pow(1 + monthlyReturn, (retirementAge - currentAge) * 12);
    let futureContributions = 0;

    for (let i = 0; i < (retirementAge - currentAge) * 12; i++) {
      // Increase the contribution based on the annual income increase
      if (i > 0 && i % 12 === 0) {
        monthlyContribution *= 1 + annualIncomeIncrease / 100;
      }
      futureContributions +=
        monthlyContribution *
        Math.pow(1 + monthlyReturn, (retirementAge - currentAge) * 12 - i - 1);
    }

    futureSavings += futureContributions;
    return futureSavings;
  }

  // Calculate the present value of the retirement expenses, increasing due to inflation
  function calculateRequiredSavings(
    monthlyExpensesAtRetirement: number,
    retirementAge: number,
    lifeExpectancy: number,
    annualInflation: number,
    postRetirementReturn: number,
  ) {
    const monthlyInflation = annualInflation / 12 / 100;
    const monthlyReturn = postRetirementReturn / 12 / 100;
    let requiredSavings = 0;

    for (let i = 0; i < (lifeExpectancy - retirementAge) * 12; i++) {
      monthlyExpensesAtRetirement *= 1 + monthlyInflation;
      requiredSavings +=
        monthlyExpensesAtRetirement / Math.pow(1 + monthlyReturn, i);
    }

    return requiredSavings;
  }

  const currentAge = 35;
  const retirmentAgeInput = 67;
  const retirementAge = retirmentAgeInput - 1;
  const lifeExpectancy = 95;
  const currentSavings = 30000;
  const monthlyContribution = 1350;
  const monthlyExpense = 3000; // This is the expense at retirement age, which needs to be inflated from today's terms
  const preRetirementReturn = 6;
  const postRetirementReturn = 5;
  const annualIncomeIncrease = 2;
  const annualInflation = 3;

  // Inflate the current monthly expenses to the retirement age
  const inflatedMonthlyExpenses =
    monthlyExpense *
    Math.pow(1 + annualInflation / 100, retirementAge - currentAge);

  const futureSavings = calculateFutureSavings(
    currentSavings,
    monthlyContribution,
    currentAge,
    retirementAge,
    preRetirementReturn,
    annualIncomeIncrease,
  );
  const requiredSavings = calculateRequiredSavings(
    inflatedMonthlyExpenses,
    retirementAge,
    lifeExpectancy,
    annualInflation,
    postRetirementReturn,
  );

  console.log(`Projected Savings at Retirement: $${futureSavings.toFixed(2)}`);
  console.log(
    `Total Retirement Savings Needed: $${requiredSavings.toFixed(2)}`,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <p>Projected savings at retirement: ${futureSavings.toFixed(2)}</p>
      <p>Total retirement savings needed: ${requiredSavings.toFixed(2)}</p>
    </main>
  );
}
