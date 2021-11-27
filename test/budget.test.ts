import { Stack } from "@aws-cdk/core";
import { expect as expectCDK, haveResourceLike } from "@aws-cdk/assert";
import { Budget } from "../lib/constructs/budget";

describe("Budget", () => {
  const stack = new Stack();
  const BUDGET_NAME = "TestBudget";
  const BUDGET_LIMIT = 1000;
  const SUBSCRIBERS = ["ops@therify.co"];
  const budgetConstruct = new Budget(stack, "Budget", {
    budgetName: BUDGET_NAME,
    budgetLimit: BUDGET_LIMIT,
    subscriberEmails: SUBSCRIBERS,
  });
  it("should create a budget", () => {
    expectCDK(stack).to(haveResourceLike("AWS::Budgets::Budget", {}));
  });
  it("should have expected budget name", () => {
    expectCDK(stack).to(
      haveResourceLike("AWS::Budgets::Budget", {
        Budget: {
          BudgetName: BUDGET_NAME,
        },
      })
    );
  });
  it("should have expected budget limit", () => {
    expectCDK(stack).to(
      haveResourceLike("AWS::Budgets::Budget", {
        Budget: {
          BudgetLimit: {
            Amount: BUDGET_LIMIT,
          },
        },
      })
    );
  });
  it("should have expected subscribers", () => {
    expectCDK(stack).to(
      haveResourceLike("AWS::Budgets::Budget", {
        NotificationsWithSubscribers: [
          {
            Subscribers: [
              {
                SubscriptionType: "EMAIL",
                Address: SUBSCRIBERS[0],
              },
            ],
          },
        ],
      })
    );
  });
});
