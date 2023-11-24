import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello.query({ text: "from tRPC" });

  // Calculate the future value of the current savings and the future value of the annuity (monthly contributions)
  function calculateFutureSavings(
    currentSavings,
    monthlyContribution,
    currentAge,
    retirementAge,
    annualReturn,
    annualIncomeIncrease,
  ) {
    const monthlyReturn = annualReturn / 12 / 100;
    const monthlyIncomeIncrease = annualIncomeIncrease / 12 / 100;
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
    monthlyExpensesAtRetirement,
    retirementAge,
    lifeExpectancy,
    annualInflation,
    postRetirementReturn,
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
  const retirementAge = 66;
  const lifeExpectancy = 95;
  const currentSavings = 30000;
  const monthlyContribution = 500;
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/usage/first-steps"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">First Steps →</h3>
            <div className="text-lg">
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Documentation →</h3>
            <div className="text-lg">
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {hello ? hello.greeting : "Loading tRPC query..."}
          </p>
        </div>

        <CrudShowcase />
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest.query();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}
