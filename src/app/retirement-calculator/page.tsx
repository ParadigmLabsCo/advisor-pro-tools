"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { FormAccordion } from "../components/FormAccordion";
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

  // Inflate the current monthly expenses to the retirement age

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("values", values);
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
    const retirementAge = parseInt(retirementAgeInput, 10) - 1;
    const inflatedMonthlyExpenses =
      parseInt(monthlyExpense, 10) *
      Math.pow(
        1 + parseInt(annualInflation, 10) / 100,
        retirementAge - parseInt(currentAge, 10),
      );

    setFutureSavings(
      calculateFutureSavings(
        parseInt(currentSavings, 10),
        parseInt(monthlyContribution, 10),
        parseInt(currentAge, 10),
        retirementAge,
        parseInt(preRetirementReturn, 10),
        parseInt(annualIncomeIncrease, 10),
      ),
    );
    setRequiredSavings(
      calculateRequiredSavings(
        inflatedMonthlyExpenses,
        retirementAge,
        parseInt(lifeExpectancy, 10),
        parseInt(annualInflation, 10),
        parseInt(postRetirementReturn, 10),
      ),
    );
  }

  console.log(`Projected Savings at Retirement: $${futureSavings.toFixed(2)}`);
  console.log(
    `Total Retirement Savings Needed: $${requiredSavings.toFixed(2)}`,
  );

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
    </main>
  );
}
