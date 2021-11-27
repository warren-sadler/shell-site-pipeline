import * as cdk from "@aws-cdk/core";
import { Budget, BudgetProps } from "../constructs/budget";

type BillingStackProps = cdk.StackProps & BudgetProps;

export class BillingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BillingStackProps) {
    super(scope, id, props);
    new Budget(this, "Budget", {
      budgetName: props.budgetName,
      budgetLimit: props.budgetLimit,
      subscriberEmails: props.subscriberEmails,
    });
  }
}
