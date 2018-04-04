import React, { Component } from 'react';
import { List, InputItem, Switch,Flex,Checkbox,Button} from 'antd-mobile';
import { createForm } from 'rc-form';
const CheckboxItem  = Checkbox.CheckboxItem ;
 class WagesComponent extends Component{
    state = {
        typeInput: 'money',
        checked:[false,false],
        hidden:false,
        tax:{price1:0,price2:0,price3:0,price4:0,price5:0},
        tab:''
    };
     constructor(props){
        super(props);
        this.setState({tab:props.type})
console.log(this.state.tab)
    }

    render(){
        const { getFieldProps,validateFields } = this.props.form;

       // const {tab} = this.state.tabs;
      //  console.log(tab);
        const { typeInput } = this.state;
        const isAndroid = typeof navigator !== 'undefined' && !!navigator.userAgent.match(/Android/i);

        const OnChecked = (target,index) => {
            let check = index ===0 ? [true,false] : [false,true];
            this.setState({checked:check});

        };

        const onSubmit = () => {


            validateFields((error,value) =>{

                if(!!error){

                    return
                }
                value.type = this.state.checked[1];

                let total = 0;

                const rates = [
                    {1500:[0,0.03]},
                    {4500:[105,0.1]},
                    {9000:[555,0.2]},
                    {35000:[1005,0.25]},
                    {55000:[2755,0.3]},
                    {80000:[5505,0.35]},
                    {80001:[13505,0.45]}
                ];


                const {salary,state,security,type} = value;
                const amount = salary - security - (type ? 4800  : 3500);
                let tax = 0,rate_k = 0,rate_item = 0;

                if(state){   //税前工资计算税后
                    for(let rate of rates){
                        const key = Object.keys(rate);
                        if(amount <= key){
                            tax = amount * rate[key][1] - rate[key][0];
                            total =  salary - security - tax;
                            rate_k = rate[key][1];rate_item = rate[key][0];
                            break;
                        }
                    }
                }
                this.setState({hidden : true,tax:{price1:amount,price2:rate_k * 100,price3:rate_item,price4:tax,price5:total}});

                console.log(value);
            })
        };

        return(
            <div>
                {this.state.hidden ?
                    <div className="my-result">
                        <p>应纳税所得额：{this.state.tax.price1}</p>
                        <p>适用税率：{this.state.tax.price2}%</p>
                        <p>速算扣除数：{this.state.tax.price3}</p>
                        <p>应缴税款：{this.state.tax.price4}</p>
                        <p>税后收入：{this.state.tax.price5}</p>
                    </div>
                    :
                    <div>{ 'year-end-bonus' === 'year-end-bonus' ?
                        <List>
                            <InputItem
                                {...getFieldProps('salary',{rules: [{required: true}]})}
                                type={typeInput}
                                placeholder="输入您的工资金额"
                                clear
                                moneyKeyboardAlign="left"
                            >年终奖</InputItem>
                        </List>:
                    <List>
                    <InputItem
                        {...getFieldProps('salary',{rules: [{required: true}]})}
                        type={typeInput}
                        placeholder="输入您的工资金额"
                        clear
                        moneyKeyboardAlign="left"
                        extra={<Switch
                            {...getFieldProps('state', {
                                initialValue: true,
                                valuePropName: 'checked',
                            })}
                            color="#ed6b07"
                            platform={isAndroid && 'android'}
                            checkedChildren="开" unCheckedChildren="关"
                            onClick={(checked) => { console.log(checked); }}
                        />}
                    >工资</InputItem>
                    <InputItem
                        type={typeInput}
                        {...getFieldProps('security')}
                        placeholder="输入您的社保金额"
                        clear

                        moneyKeyboardAlign="left"
                    >社保</InputItem>
                    <Flex style={{ padding: '0 10px' }}>
                        <Flex.Item style={{ padding: '15px 0',  flex: 'none' }}>个税起征点</Flex.Item>

                        <Flex.Item>
                            <CheckboxItem checked={this.state.checked[0]} name="radio" className="my-radio" onChange={e =>  OnChecked(e.target,0)}>国内：3500</CheckboxItem >
                        </Flex.Item>
                        <Flex.Item>
                            <CheckboxItem  checked={this.state.checked[1]}  name="radio" className="my-radio" onChange={e => OnChecked(e.target,1)}>外籍：4800</CheckboxItem >
                        </Flex.Item>


                    </Flex>

                </List>}
                <Button type="primary" onClick={() =>{onSubmit()}}>计算</Button>
                <Button type="reset" className="reset">重置</Button>
                </div>}
            </div>

        )
    }
}

export default createForm()(WagesComponent);