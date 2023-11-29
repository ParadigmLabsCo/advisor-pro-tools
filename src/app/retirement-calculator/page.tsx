"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FormAccordion } from "../components/FormAccordion";
import RetirementChart from "../components/RetirementChart";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

import {
  calculateAnnualSavingsUntilRetirement,
  calculateFutureSavings,
  calculateRequiredSavings,
  calculateYearlyDrawdown,
  drawdownSavingsAfterRetirement,
  solveForMonthlyContribution,
} from "./utils";

const formSchema = z.object({
  currentAge: z.string(),
  preTaxIncome: z.string(),
  currentSavings: z.string(),
  monthlyContribution: z.string(),
  monthlyExpense: z.string(),
  retirementAgeInput: z.string(),
  lifeExpectancy: z.string(),
  preRetirementReturn: z.string(),
  postRetirementReturn: z.string(),
  annualInflation: z.string(),
  annualIncomeIncrease: z.string(),
});

export default function RetirementCalculator() {
  const [futureSavings, setFutureSavings] = useState(0);
  const [requiredSavings, setRequiredSavings] = useState(0);
  const [savingsData, setSavingsData] = useState([]);
  const [needsData, setNeedsData] = useState([]);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: "35",
      preTaxIncome: "",
      currentSavings: "",
      monthlyContribution: "",
      monthlyExpense: "",
      retirementAgeInput: "67",
      lifeExpectancy: "95",
      preRetirementReturn: "6",
      postRetirementReturn: "5",
      annualInflation: "3",
      annualIncomeIncrease: "2",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const {
      currentAge,
      currentSavings,
      monthlyContribution,
      monthlyExpense,
      retirementAgeInput,
      preRetirementReturn,
      postRetirementReturn,
      annualIncomeIncrease,
      lifeExpectancy,
      annualInflation,
    } = values;
    const retirementAge = parseInt(retirementAgeInput, 10);
    const inflatedMonthlyExpenses =
      parseInt(monthlyExpense, 10) *
      Math.pow(
        1 + parseInt(annualInflation, 10) / 100,
        retirementAge - parseInt(currentAge, 10),
      );

    const calculatedFutureSavings = calculateFutureSavings(
      parseInt(currentSavings, 10),
      parseInt(monthlyContribution, 10),
      parseInt(currentAge, 10),
      retirementAge,
      parseInt(preRetirementReturn, 10),
      parseInt(annualIncomeIncrease, 10),
    );

    const calculatedRequiredSavings = calculateRequiredSavings(
      inflatedMonthlyExpenses,
      retirementAge,
      parseInt(lifeExpectancy, 10),
      parseInt(annualInflation, 10),
      parseInt(postRetirementReturn, 10),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const annualSavings = calculateAnnualSavingsUntilRetirement(
      parseInt(currentSavings, 10),
      parseInt(monthlyContribution, 10),
      parseInt(currentAge, 10),
      retirementAge,
      parseInt(preRetirementReturn, 10),
      parseInt(annualIncomeIncrease, 10),
    );

    // Get the savings amount at retirement to use as the starting amount for drawdown
    const savingsAtRetirement = annualSavings[retirementAge - 1];

    // Drawdown savings after retirement
    const drawdownSavings = drawdownSavingsAfterRetirement(
      savingsAtRetirement, // startingSavings
      retirementAge, // retirementAge
      parseInt(lifeExpectancy, 10), // lifeExpectancy
      inflatedMonthlyExpenses, // monthlyExpensesAtRetirement
      parseInt(annualInflation, 10), // annualInflation
      parseInt(postRetirementReturn, 10), // postRetirementReturn
    );

    const monthlyContributionRequired = solveForMonthlyContribution(
      parseInt(currentSavings, 10),
      calculatedRequiredSavings,
      parseInt(currentAge, 10),
      retirementAge,
      parseInt(preRetirementReturn, 10),
      parseInt(annualIncomeIncrease, 10),
    );

    const requiredAnnualSavings = calculateAnnualSavingsUntilRetirement(
      parseInt(currentSavings, 10),
      monthlyContributionRequired,
      parseInt(currentAge, 10),
      retirementAge + 1,
      parseInt(preRetirementReturn, 10),
      parseInt(annualIncomeIncrease, 10),
    );

    const requiredSavingsAtRetirement = requiredAnnualSavings[retirementAge];

    const yearlyDrawdown = calculateYearlyDrawdown(
      requiredSavingsAtRetirement,
      retirementAge,
      parseInt(lifeExpectancy, 10),
      inflatedMonthlyExpenses,
      parseInt(annualInflation, 10),
      parseInt(postRetirementReturn, 10),
    );

    const completeSavingsProjection = { ...annualSavings, ...drawdownSavings };
    const completeRequiresSavingsProjection = {
      ...requiredAnnualSavings,
      ...yearlyDrawdown,
    };

    const calculatedFutureSavingsArray = Object.entries(
      completeSavingsProjection,
    ).map(([age, value]) => ({ age: parseInt(age, 10), value }));

    const calculatedRequiredSavingsArray = Object.entries(
      completeRequiresSavingsProjection,
    ).map(([age, value]) => ({ age: parseInt(age, 10), value }));

    setSavingsData(calculatedFutureSavingsArray);
    setNeedsData(calculatedRequiredSavingsArray);

    setFutureSavings(calculatedFutureSavings);
    setRequiredSavings(calculatedRequiredSavings);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-10 space-y-8"
        >
          <FormField
            control={form.control}
            name="currentAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current age</FormLabel>
                <FormControl>
                  <Input placeholder="35" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preTaxIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual pre-tax income</FormLabel>
                <FormControl>
                  <Input placeholder="$60,000" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentSavings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current retirement savings</FormLabel>
                <FormControl>
                  <Input placeholder="$30,000" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly contribution</FormLabel>
                <FormControl>
                  <Input placeholder="$1343" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlyExpense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly budget in retirement</FormLabel>
                <FormControl>
                  <Input placeholder="$3000" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormAccordion label="Advanced details">
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="retirementAgeInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retirement age</FormLabel>
                    <FormControl>
                      <Input placeholder="67" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lifeExpectancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Life Expectancy</FormLabel>
                    <FormControl>
                      <Input placeholder="95" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preRetirementReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-retirement rate of return</FormLabel>
                    <FormControl>
                      <Input placeholder="6%" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postRetirementReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post-retirement rate of return</FormLabel>
                    <FormControl>
                      <Input placeholder="5%" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualInflation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inflation rate</FormLabel>
                    <FormControl>
                      <Input placeholder="$3000" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualIncomeIncrease"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual income increase</FormLabel>
                    <FormControl>
                      <Input placeholder="2%" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormAccordion>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <p>Projected savings at retirement: ${futureSavings.toFixed(2)}</p>
      <p>Total retirement savings needed: ${requiredSavings.toFixed(2)}</p>
      <div className="w-full">
        <h1>Retirement Savings Plan</h1>
        <RetirementChart savingsData={savingsData} needsData={needsData} />
      </div>
    </main>
  );
}
