import React, { Component } from 'react';
import {  Tabs,WhiteSpace,List, InputItem, Switch,Flex,Checkbox,Button,Picker,Toast,Modal  } from 'antd-mobile';
import styles from './app.less';
import { createForm } from 'rc-form';
const CheckboxItem  = Checkbox.CheckboxItem ;

class App extends Component {

    state={
        typeInput: 'money',
        checked:[false,false],
        hidden:false,
        tax:{price1:0,price2:0,price3:0,price4:0,price5:0},
        tab:0,
        sValue: ['0'],
    };
    onClose = key => () => {
        this.setState({
            hidden: false,
        });
    }

  render() {
      const tabs = [
          { title: '工资、薪金所得' },
          { title: '年终奖' },
          { title: '其他' },
      ];

      const incomeType = [
              {
                  label: '劳务报酬所得',
                  value: 0,
              },
              {
                  label: '个体工商户生产、经营所得',
                  value: 1,
              },
              {
                  label: '对企事业单位的承包、承租经营所得',
                  value: 2,
              },
              {
                  label: '稿酬所得',
                  value: 3,
              },
              {
                  label: '特许权使用费所得',
                  value: 4,
              },
              {
                  label: '财产租赁所得',
                  value: 5,
              },
              {
                  label: '财产转让所得',
                  value: 6,
              },
              {
                  label: '利息、股息、红利所得',
                  value: 7,
              },
              {
                  label: '偶然所得',
                  value: 8,
              }
      ];

      const onTabClick = (tab, index) =>{
           this.setState({tab:index});
      };




      const calculate = (amount,rates,amoutAvg) =>{
          let taxes = 0,k = 0,item = 0;
          if(amount <= 0){
              Toast.info('无需交税');
          }else{
              for(let rate of rates){
                  const key = Object.keys(rate);
                  const last = rates[rates.length - 1],lastKey = Object.keys(last);
                  const flag = amoutAvg ? amoutAvg : amount;
                  if(parseInt(flag) <= parseInt(key) ){
                      taxes = amount * rate[key][1] - rate[key][0];
                      k = rate[key][1];item = rate[key][0];
                      break;
                  }
                  if(parseInt(flag) > parseInt(lastKey) ){
                      k = last[lastKey][1];item = last[lastKey][0];
                      taxes = amount * k - item;
                      break;
                  }
              }
          }
          return ({taxes,k,item})
      }

      const { getFieldProps,validateFields,resetFields } = this.props.form;
      const { typeInput } = this.state;
      const isAndroid = typeof navigator !== 'undefined' && !!navigator.userAgent.match(/Android/i);

      const OnChecked = (target,index) => {
          let check = index ===0 ? [true,false] : [false,true];
          this.setState({checked:check});

      };

      const onSubmit = () => {
          validateFields((error,value) =>{
              if(!!error){
                  Toast.info('请填写完整');
                  return
              }
              let total = 0;
              const {tab} = this.state;

              const {salary,state,security,yearEnd} = value;
              let amount = 0;
              let tax = 0,rate_k = 0,rate_item = 0;

              const rates = [
                  {1500:[0,0.03]},
                  {4500:[105,0.1]},
                  {9000:[555,0.2]},
                  {35000:[1005,0.25]},
                  {55000:[2755,0.3]},
                  {80000:[5505,0.35]},
                  {80001:[13505,0.45]}
              ];
              switch (tab){
                  case 0:
                      const type = this.state.checked[1];
                      amount = salary - security - (type ? 4800  : 3500);
                      if(state){   //税前工资计算税后
                          const  {taxes,k,item} =   calculate(amount,rates);
                          tax = taxes;
                          rate_k = k;
                          rate_item = item;
                          total =  salary - security - taxes;
                      }
                      else{
                          amount = salary - (type ? 4800  : 3500);
                          const ratesAfter = [
                              {1455:[0,0.03]},
                              {4155:[105,0.1]},
                              {7755:[555,0.2]},
                              {27255:[1005,0.25]},
                              {41255:[2755,0.3]},
                              {57505:[5505,0.35]},
                              {57506:[13505,0.45]}
                          ];
                          const k_after = calculate(amount,ratesAfter).k,
                                item_after = calculate(amount,ratesAfter).item;
                          amount =( amount - item_after)/(1 - k_after);
                          let  {taxes,k,item} =   calculate(amount,rates);
                          tax = taxes;
                          rate_k = k;
                          rate_item = item;
                          total =  parseFloat(salary) + parseFloat(security) + parseFloat(tax);
                      }
                      break;
                  case 1:
                      amount = yearEnd ;
                      const  {taxes,k,item} = calculate(amount,rates,amount / 12);
                      tax = taxes;
                      rate_k = k;
                      rate_item = item;
                      total =  amount  - tax;

                      break;
                  case 2:
                       const {incomeType,income} =  value;
                      const gtgs_rate = [{15000:[0,0.05]},{30000:[750,0.1]},{60000:[3750,0.2]},{100000:[9750,0.3]},{100001:[14750,0.35]}];//个体工商
                       switch (incomeType[0]){
                           case 0:
                               const lw_rate = [{20000:[0,0.2]},{50000:[2000,0.3]},{50001:[7000,0.4]}];//劳务
                               amount = income > 4000 ? income * 0.8 : income - 800;
                               const  {taxes,k,item} = calculate(amount,lw_rate);
                               tax = taxes;
                               rate_k = k;
                               rate_item = item;
                               break;
                           case 1:
                               amount = income;
                               const  res = calculate(amount,gtgs_rate);
                               tax = res.taxes;
                               rate_k = res.k;
                               rate_item = res.item;
                               break;
                           case 2:
                               amount = income - (3500 *12);
                               const  res2 = calculate(amount,gtgs_rate);
                               tax = res2.taxes;
                               rate_k = res2.k;
                               rate_item = res2.item;
                               break;
                           case 3:
                               amount = income > 4000 ? income * 0.8 : income - 800;
                               tax = amount * 0.14;
                               break;
                           case 4:
                           case 5:
                               amount = income > 4000 ? income * 0.8 : income - 800;
                               tax = amount * 0.2;
                               break;
                           case 6:
                           case 7:
                           case 8:
                               amount = income;
                               tax = amount * 0.2;
                               break;
                           default:
                               break;
                       }
                      total =  income  - tax;
                      break;
                  default:
                      break;
              }

              const data = {price1:amount,price2:rate_k * 100,price3:rate_item,price4:tax,price5:total};
              if(amount > 0){
                  this.setState({hidden : true,tax:data});
              }
              console.log(data);
          })
      };

      const onReset = () =>{
          resetFields();
      }
    return (
      <div className={styles.App}>
          <div   className="container">
              <Tabs tabs={tabs}
                    initialPage={0}
                    onTabClick={(tab, index) => { onTabClick(tab, index) }}
              >
                  <div>
                      { this.state.tab === 1 ?
                              <List>
                                  <InputItem
                                      {...getFieldProps('yearEnd',{rules: [{required: true}]})}
                                      type={typeInput}
                                      placeholder="输入您的工资金额"
                                      clear
                                      moneyKeyboardAlign="left"
                                  >年终奖</InputItem>
                              </List>:
                              this.state.tab === 2 ?
                              <List>
                                  <Picker data={incomeType} cols={1} {...getFieldProps('incomeType', {
                                      initialValue: [0],
                                  })} title="选择收入类型" extra="请选择收入类型" >
                                      <List.Item arrow="horizontal">收入类型</List.Item>
                                  </Picker>
                                  <InputItem
                                      {...getFieldProps('income',{rules: [{required: true}]})}
                                      type={typeInput}
                                      placeholder="输入您的收入金额"
                                      clear
                                      moneyKeyboardAlign="left"
                                  >收入金额</InputItem>
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
                             <div className="buttonGroup"> <Button size="middle" type="primary" onClick={() =>{onSubmit()}}>计算</Button>
                                 <Button type="reset" className="reset" onClick={()=> onReset()}>重置</Button></div>
                  </div>
              </Tabs>

              <WhiteSpace />
          </div>
          <Modal
              visible={this.state.hidden}
              transparent
              maskClosable={false}
              onClose={this.onClose()}
              title="计算结果"
              footer={[{ text: '确定', onPress: () => { console.log('ok'); this.onClose()(); } }]}
          >
              <div className="my-result">
                  <p>应纳税所得额：{this.state.tax.price1}</p>
                  <p>适用税率：{this.state.tax.price2}%</p>
                  <p>速算扣除数：{this.state.tax.price3}</p>
                  <p>应缴税款：{this.state.tax.price4}</p>
                  <p>税后收入：{this.state.tax.price5}</p>
              </div>
          </Modal>

      </div>
    );
  }
}

export default createForm()(App);
