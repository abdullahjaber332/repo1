import React from 'react';
import logo from './logo.svg';
import './App.css';
import './styles.css';
import faker from 'faker';
import moment from 'moment'
const isJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return false;
  }
}


class App extends React.Component{
	
	
	state = {
    data: [],
    inputVals: { amount: 0, month: 1, customer: '' },
    monthTotals: {},
    customerTotals: {},
    errors: {},
    addNew: false,
    grandTotal: 0,
    generateNow: false
  };
  componentDidMount = () => {
    const data = isJson(localStorage.data);
    this.setInitData(data || []);
  }
  clearData = () => {
    localStorage.clear();
    this.setState({
      data: [],
      inputVals: { amount: 0, month: 1, customer: '' },
      monthTotals: {},
      customerTotals: {},
      errors: {},
      addNew: false,
      grandTotal: 0,
      generateNow: false
    });
  }
  setValue = (e) => {
    const { inputVals, errors } = this.state;
    const { target: { name, value, type } = {} } = e || {};
    inputVals[name] = value;
    if (type === 'number') {
      inputVals[name] = Number(value);
    }
    delete errors[name];
    this.setState({ inputVals, errors });
  }
  calcPoints = (transaction) => {
    let points = 0;
    if (transaction > 50) {
      points += (transaction > 100 ? 50 : transaction - 50) * 1;
    }
    if (transaction > 100) {
      points += (transaction - 100) * 2;
    }
    return points;
  }
  setInitData = (data) => {
    const monthTotals = {};
    const customerTotals = {};
    data.forEach((transaction) => {
      if (!monthTotals[transaction.month]) {
        monthTotals[transaction.month] = {
          total: 0,
          data: []
        };
      }
      monthTotals[transaction.month].total += transaction.points || 0;
      monthTotals[transaction.month].data.push(transaction);
      if (!customerTotals[transaction.customer]) {
        customerTotals[transaction.customer] = 0;
      }
      customerTotals[transaction.customer] += transaction.points || 0;
    });
    const grandTotal = Object.values(monthTotals).reduce((a, b) => a + b.total, 0);
    localStorage.setItem('data', JSON.stringify(data));
    this.setState({
      data,
      inputVals: { amount: 0, month: 1, customer: '' },
      addNew: false,
      monthTotals,
      customerTotals,
      grandTotal,
      generateNow: false
    })
  }
  mockData = () => {
    const noOfUsers = Math.round(Math.random() * 10 + 2);
    const randomUsers = Array.from({ length: noOfUsers }).map(() => faker.name.firstName());
    const randomData = Array.from({ length: this.state.dataToGenerate }).map(() => {
      const customer = randomUsers[Math.round(Math.random() * (randomUsers.length - 1))];
      const amount = Math.round(faker.finance.amount());
      const points = this.calcPoints(amount);
      return {
        customer,
        amount,
        month: Math.floor(Math.random() * 3 + 1),
        points
      };
    });
    this.setInitData(randomData);
  }
  addTransaction = () => {
    const newData = this.state.inputVals;
    if (this.checkFormError(newData)) {
      return;
    }
    newData.points = this.calcPoints(newData.amount);
    const data = [...this.state.data, newData];
    this.setInitData(data)
  };
  checkFormError = (data) => {
    const { errors } = this.state;
    Object.keys(data).forEach((key) => {
      if (!data[key]) errors[key] = true;
    });

    const errorFields = Object.keys(errors);
    this.setState({ errors });
    return errorFields.length;
  };
  render() {
    const {
      inputVals,
      errors,
      addNew,
      monthTotals,
      grandTotal,
      customerTotals,
      generateNow,
      dataToGenerate
    } = this.state;
    const months = Object.keys(monthTotals);
    const customers = Object.keys(customerTotals);
    return <section className="section-primary-block">
      <div className="primary-block-2">
        <div className="title">Transactions</div>
        <button className="add-btn" disabled={addNew || generateNow} onClick={() => this.setState({ addNew: true })}>Add</button>
        <button className="add-btn" onClick={this.clearData}>Clear Data</button>
        <button className="add-btn" disabled={generateNow || addNew} onClick={() => this.setState({ generateNow: true })}>Generate Mock Data</button>
      </div>
      {months.length ? <div className="primary-block-2" style={{ display: 'block' }}>
        <div className="control-group" style={{ width: '100%' }}>
          <label className="control-label">Grand Total</label>
          <div className="control">{(grandTotal || 0).toLocaleString()}</div>
        </div>
        {months.map((m) => <div key={m} className="control-group-1">
          <label>{moment(m, 'MM').format('MMMM')}</label>
          <div className="control">{(monthTotals[m].total || 0).toLocaleString()}</div>
        </div>)}
      </div> : null}
      {generateNow && <div className="primary-block-2">
        <div className="control-group">
          <label className="control-label"># of Transactions</label>
          <input type="number" name="amount" className="control" value={dataToGenerate} onChange={(e) => this.setState({ dataToGenerate: e.target.value })} />
        </div>
        <button className="add-btn" onClick={this.mockData}>Generate Now</button>
        <button className="add-btn" onClick={() => this.setState({ generateNow: false })}>Cancel</button>
      </div>}
      {addNew && <div className="primary-block-2">
        <div className="control-group">
          <label className="control-label">Amount</label>
          <input type="number" name="amount" className="control" value={inputVals.amount} onChange={this.setValue} />
          {errors.amount && <label className="control-error">required</label>}
        </div>
        <div className="control-group">
          <label className="control-label">Customer Name</label>
          <input type="text" name="customer" className="control" value={inputVals.customer} onChange={this.setValue} />
          {errors.customer && <label className="control-error">required</label>}
        </div>
        <div className="control-group">
          <label className="control-label">Month</label>
          <select name="month" className="control" value={inputVals.month} onChange={this.setValue}>
            {Array.from({ length: 3 }).map((i, m) => <option key={m} value={m + 1}>{moment(m + 1, 'MM').format('MMMM')}</option>)}
          </select>
          {errors.month && <label className="control-error">required</label>}
        </div>
        <button className="add-btn" onClick={this.addTransaction}>Add</button>
        <button className="add-btn" onClick={() => this.setState({ addNew: false, inputVals: { amount: 0, month: 1, customer: '' } })}>Cancel</button>
      </div>}
      {months.map((m) => <div className="primary-block" key={`month-${m}`}>
        <div style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bolder' }}>
          {moment(m, 'MM').format('MMMM')}
        </div>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {(monthTotals[m].data || []).map((d, i) => <tr key={i}>
              <td>{d.customer}</td>
              <td>{d.amount.toLocaleString()}</td>
              <td>{(d.points || 0).toLocaleString()}</td>
            </tr>)}
          </tbody>
        </table>
      </div>)}
      {customers.length ? <div className="primary-block-2" style={{ display: 'block' }}>
        {customers.map((m) => <div key={m} className="control-group-1">
          <label>{m}</label>
          <div className="control">{(customerTotals[m] || 0).toLocaleString()}</div>
        </div>)}
      </div> : null}
    </section>;
  }
	
	
}

export default App;
