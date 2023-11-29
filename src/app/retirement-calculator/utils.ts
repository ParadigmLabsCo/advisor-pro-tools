// Calculate the future value of the current savings and the future value of the annuity (monthly contributions)
export function calculateFutureSavings(
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
export function calculateRequiredSavings(
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

export function calculateAnnualSavingsUntilRetirement(
  currentSavings: number,
  monthlyContribution: number,
  currentAge: number,
  retirementAge: number,
  annualReturn: number,
  annualIncomeIncrease: number,
) {
  const savingsPerYear = {};
  let currentAnnualContribution = monthlyContribution * 12;
  let savings = currentSavings;
  const monthlyReturnRate = annualReturn / 12 / 100;

  for (let age = currentAge; age < retirementAge; age++) {
    // Calculate the savings for the year
    for (let month = 1; month <= 12; month++) {
      savings = savings * (1 + monthlyReturnRate) + monthlyContribution;
    }

    // Increase the annual contribution for next year
    currentAnnualContribution *= 1 + annualIncomeIncrease / 100;
    monthlyContribution = currentAnnualContribution / 12;

    // Store the accumulated savings for the year
    savingsPerYear[age + 1] = savings;
  }

  return savingsPerYear;
}

export function drawdownSavingsAfterRetirement(
  startingSavings: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpensesAtRetirement: number,
  annualInflation: number,
  postRetirementReturn: number,
) {
  const drawdownPerYear = { [retirementAge + 1]: startingSavings };
  let savings = startingSavings;
  let adjustedMonthlyExpenses = monthlyExpensesAtRetirement;
  const monthlyReturnRate = postRetirementReturn / 12 / 100;
  const monthlyInflationRate = annualInflation / 12 / 100;

  for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
    let annualExpenses = 0;

    // Calculate monthly and apply annual inflation
    for (let month = 1; month <= 12; month++) {
      savings *= 1 + monthlyReturnRate; // Compound the savings monthly
      adjustedMonthlyExpenses *= 1 + monthlyInflationRate; // Apply inflation monthly
      annualExpenses += adjustedMonthlyExpenses; // Accumulate expenses for the year
    }

    savings -= annualExpenses; // Withdraw annual expenses at the end of the year
    savings = Math.max(savings, 0); // Do not allow the savings to go negative
    drawdownPerYear[age] = savings;
  }

  return drawdownPerYear;
}

export function solveForMonthlyContribution(
  currentSavings: number,
  futureSavingsGoal: number,
  currentAge: number,
  retirementAge: number,
  annualReturn: number,
  annualIncomeIncrease: number,
) {
  const months = (retirementAge - currentAge) * 12;
  const monthlyReturn = annualReturn / 12 / 100;
  const incomeIncreaseRate = 1 + annualIncomeIncrease / 100;

  // Future value of current savings at retirement
  const futureValueCurrentSavings =
    currentSavings * Math.pow(1 + monthlyReturn, months);

  // If the future value of current savings is already greater than the goal, no additional contributions are needed
  if (futureValueCurrentSavings >= futureSavingsGoal) {
    return 0;
  }

  let monthlyContribution = 0;
  let futureValueContributions = 0;

  // Iterate to approximate the required monthly contribution
  // This uses a numerical method since there's no algebraic solution to this problem due to the increasing contributions
  for (let i = 1; i <= months; i++) {
    futureValueContributions +=
      monthlyContribution * Math.pow(1 + monthlyReturn, months - i);

    if (i % 12 === 0) {
      // Adjust the contribution every year based on the income increase
      monthlyContribution *= incomeIncreaseRate;
    }
  }

  // Adjust monthly contribution until the future value of contributions matches the shortfall to the future savings goal
  const shortfall = futureSavingsGoal - futureValueCurrentSavings;
  let step = shortfall / months; // Initial step for approximation
  const precision = 0.01; // How close we need to get to the goal

  while (Math.abs(futureValueContributions - shortfall) > precision) {
    if (futureValueContributions < shortfall) {
      monthlyContribution += step;
    } else {
      monthlyContribution -= step;
      step /= 2; // Decrease step to fine-tune the approximation
    }

    futureValueContributions = 0;
    let adjustedContribution = monthlyContribution;

    for (let i = 1; i <= months; i++) {
      futureValueContributions +=
        adjustedContribution * Math.pow(1 + monthlyReturn, months - i);

      if (i % 12 === 0) {
        adjustedContribution *= incomeIncreaseRate;
      }
    }
  }

  return monthlyContribution;
}

export function calculateYearlyDrawdown(
  requiredSavingsAtRetirement: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpensesAtRetirement: number,
  annualInflation: number,
  postRetirementReturn: number,
) {
  const drawdownPerYear = { [retirementAge]: requiredSavingsAtRetirement };
  let savings = requiredSavingsAtRetirement;
  let adjustedMonthlyExpenses = monthlyExpensesAtRetirement;
  const monthlyReturnRate = postRetirementReturn / 12 / 100;
  const monthlyInflationRate = annualInflation / 12 / 100;

  for (let age = retirementAge; age <= lifeExpectancy; age++) {
    let annualExpenses = 0;

    // Calculate monthly and apply annual inflation
    for (let month = 1; month <= 12; month++) {
      savings *= 1 + monthlyReturnRate; // Compound the savings monthly
      adjustedMonthlyExpenses *= 1 + monthlyInflationRate; // Apply inflation monthly
      annualExpenses += adjustedMonthlyExpenses; // Accumulate expenses for the year
    }

    savings -= annualExpenses; // Withdraw annual expenses at the end of the year
    savings = Math.max(savings, 0); // Do not allow the savings to go negative
    drawdownPerYear[age] = savings;
  }

  return drawdownPerYear;
}
