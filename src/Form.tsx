import React, { Component, ChangeEvent } from "react";
import AsyncValidator from "async-validator";

interface Props extends React.Props<any> {}
interface State {}
interface FromOptions {}
interface FieldOptions {
  validator: object[];
}

interface InputXProps {
  data: any;
  form: Form;
}

interface Form {
  getFieldProps: (fieldKey: string, options?: any) => {};
  getFieldError: (fieldKey: string) => {};
}

type AnyComponent<P = any> =
  | (new (props: P) => React.Component)
  | ((props: P & { children?: React.ReactNode }) => React.ReactElement<any> | null);

class InputX extends Component<InputXProps> {
  constructor(props: InputXProps) {
    super(props);
    this.state = {};
  }
  render() {
    const { form } = this.props;
    const { getFieldProps, getFieldError } = form;
    return (
      <React.Fragment>
        <input
          {...getFieldProps("inputKey", {
            validator: [
              {
                require: true,
                message: "请输入用户名"
              },
              {
                max: 8,
                min: 3,
                message: "请输入3-8个字符"
              }
            ]
          })}
        />
        <div {...getFieldError("inputKey")}></div>
      </React.Fragment>
    );
  }
}

function FromCreate(options?: FromOptions) {
  const store = {} as any;
  return (WrappedComponent: AnyComponent) => {
    return class HOCWrappedComponent extends Component {
      constructor(props: Props) {
        super(props);
        this.state = {};
      }

      getFieldProps = (fieldKey: string, options: FieldOptions) => {
        const self = this;
        const vallidator = new AsyncValidator({ [fieldKey]: options.validator });
        return {
          onInput(e: ChangeEvent<HTMLInputElement>) {
            const value = e.target.value;
            store[fieldKey] = {};
            store[fieldKey]["value"] = value;
            vallidator
              .validate({ [fieldKey]: value })
              .then(ret => {
                store[fieldKey]["error"] = null;
                self.forceUpdate();
              })
              .catch(({ errors }) => {
                store[fieldKey]["error"] = errors.map((err: any) => err.message);
                self.forceUpdate();
              });
          }
        };
      };

      getFieldError = (fieldKey: string) => {
        return {
          children: store[fieldKey] && store[fieldKey].error
        };
      };

      render() {
        const form = {
          getFieldProps: this.getFieldProps,
          getFieldError: this.getFieldError
        };
        return <WrappedComponent form={form}></WrappedComponent>;
      }
    };
  };
}

const FromCreateComponent = FromCreate()(InputX);

export default class extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <FromCreateComponent> </FromCreateComponent>
      </div>
    );
  }
}
