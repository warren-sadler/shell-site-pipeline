import { CfnBudget } from "@aws-cdk/aws-budgets";
import { Construct } from "@aws-cdk/core";

interface BudgetProps {
  budgetName: string;
  budgetLimit: number;
  subscriberEmails: string[];
}

function buidlSubscription(subscriberEmails: string[]) {
  return subscriberEmails.map((email) => ({
    address: email,
    subscriptionType: "EMAIL",
  }));
}

export class Budget extends Construct {
  constructor(scope: Construct, id: string, props: BudgetProps) {
    super(scope, id);
    new CfnBudget(this, props.budgetName, {
      budget: {
        budgetName: props.budgetName,
        budgetLimit: {
          amount: props.budgetLimit,
          unit: "USD",
        },
        timeUnit: "MONTHLY",
        budgetType: "COST",
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: props.budgetLimit,
          },
          subscribers: buidlSubscription(props.subscriberEmails),
        },
      ],
    });
  }
}
