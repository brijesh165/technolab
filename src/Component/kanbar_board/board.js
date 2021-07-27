import React from 'react';
import axios from 'axios';

import './board.css';
import { Row, Col, Button, Modal, Form, Card} from 'react-bootstrap';
import { BsChat } from 'react-icons/bs';
import { RiAddLine } from 'react-icons/ri';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { AiOutlineArrowDown } from 'react-icons/ai';
import userPng from './../../assets/user.png';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addNewColumnModal: false,
            columnName: "",
            taskName: "",
            columnList: []
        }

        this.onAddNewColumn = this.onAddNewColumn.bind(this);
        this.onCloseAddNewColumnModal = this.onCloseAddNewColumnModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSaveNewColumn = this.onSaveNewColumn.bind(this);
        this.onUparrow = this.onUparrow.bind(this);
        this.onDownarrow = this.onDownarrow.bind(this);
    }

    // Execute when clicked on new column
    onAddNewColumn() {
        console.log("Add New Column")
        this.setState({
            addNewColumnModal: true
        })
    }

    // handle close event of add new column modal
    onCloseAddNewColumnModal() {
        this.setState({
            addNewColumnModal: !this.state.addNewColumnModal
        })
    }

    // handle input change
    handleChange(e) {
        e.preventDefault();
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    // executes when user save new column
    onSaveNewColumn() {        
        this.setState({
            addNewColumnModal: !this.state.addNewColumnModal,
        })

        axios.post(`http://demo.ciaoworks.com/practical/kanban/?postData=column&data={name:${this.state.taskName},column_id:5}`)
        .then((res) => {
            console.log("Response: ", res)
            const column = {
                id: Math.floor(Math.random()*(999-100+1)+100),
                name: this.state.columnName,
                order: 5,
                taskList: []
            }
            const newColumnList = [...this.state.columnList, column];
            if (res.status === 200) {
                this.setState({
                    columnList: newColumnList
                })
            }
        })
        .catch((error) => {
            console.log("Error: ", error);
        })
    }

    // executes when user adds a task in column
    onAddTask(e, column_id, column_order) {
        e.preventDefault();

        axios.post(`http://demo.ciaoworks.com/practical/kanban/?postData=task&data={name:${this.state.taskName},column_id:${column_order}}`)
        .then((res) => {
            console.log("Response: ", res)
            if (res.data.status === 200) {
                const newTask = {
                    id: Math.floor(Math.random()*(9999-1000+1)+1000),
                    column_id: column_id,
                    name: this.state.taskName,
                    sort_order: 0
                }
                const allColumnWithTask = this.state.columnList[column_order].taskList;
                const afterAdd = [...allColumnWithTask, newTask];
                const columnlist = this.state.columnList;
                columnlist[column_order].taskList = afterAdd;

                this.setState({
                    columnList: columnlist
                });
                console.log("List: ", afterAdd)
            }
        })
        .catch((error) => {
            console.log("Error: ", error);
        })
    }

    // arranges column in ascending order
    onUparrow() {
        const ascendingOrder = this.state.columnList.sort((a, b) => a.order - b.order);
        console.log("Asc: ", ascendingOrder)
        this.setState({
            columnList: ascendingOrder
        })
    }

    // arranges column in descending order
    onDownarrow() {
        const descendingOrder = this.state.columnList.sort((a, b) => a.order - b.order).reverse();
        console.log("Dsc: ", descendingOrder)
        this.setState({
            columnList: descendingOrder
        })
    }

    async componentDidMount() {
        let columnList = [];
        await axios.get("http://demo.ciaoworks.com/practical/kanban/?getData=columns")
        .then((res) => {
            columnList = res.data;
        })
        .catch(error => {
            console.log("Error: ", error);
        })

        await axios.get("http://demo.ciaoworks.com/practical/kanban/?getData=tasks")
        .then((res) => {
            console.log("Tasks: ", res.data)
            for (let column of columnList) {
                column.taskList = res.data.filter((item) => {
                    return item.column_id === column.id
                })
            }

            const removeColumnWithoutTask = columnList.filter((item) => {
                return  item.order > 0
            });
            console.log("After: ", removeColumnWithoutTask)
            this.setState({
                columnList: removeColumnWithoutTask.sort((a, b) => a.order - b.order)
            })

            console.log("Column List: ", this.state.columnList)
        })
        .catch(error => {
            console.log("Error: ", error);
        })
    }

    render() {
        return (
            <div className="boardWrapper">
                <div className="scrolls">
                    <div className="mt-2 columns" style={{ width: "250px", textAlign: "left"}}>
                            <Button variant="light"  style={{width: "250px", textAlign: "left"}} onClick={this.onAddNewColumn}><RiAddLine /> New Column</Button>
                    </div>
                    {this.state.columnList.length > 0 && 
                         this.state.columnList.map((item, index) => {
                            return (
                                <div key={index} className="mt-2 columns" >
                                    <Card style={{ width: '25rem'}} className="parentCard">
                                        <Card.Header as="h5" className="cardTitle">
                                            {item.name}
                                            <div>
                                            <Button variant="light" onClick={this.onUparrow}><AiOutlineArrowUp /></Button>
                                            <Button variant="light" onClick={this.onDownarrow}><AiOutlineArrowDown /></Button>
                                            </div>
                                            </Card.Header>
                                        <Card.Body>
                                            {this.state.columnList[index].taskList.length > 0 && 
                                                this.state.columnList[index].taskList.map((item, index) => {
                                                    return (
                                                        <Card key={index} className="childCard">
                                                            <Card.Header className="cardHeader">
                                                                <Form.Check type="radio" style={{ marginRight: "10px"}}/>
                                                                {item.name}
                                                            </Card.Header>

                                                            <Card.Body className="cardBody">
                                                                <div className="firstRow">
                                                                    <p style={{marginRight: "10px"}}>75%</p>
                                                                    <p style={{marginRight: "10px"}}><BsChat /> 2</p>
                                                                </div>
                                                                <div className="secondRow" >
                                                                    <img src={userPng} alt="profileImage" className="profileImage"/>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    )   
                                                })
                                            }
                                        </Card.Body>
                                        <Card.Footer>
                                        <Form className="mt-4">
                                        <Row className="align-items-center">
                                            <Col sm={10} className="my-1">
                                                <Form.Control 
                                                type="text"
                                                name="taskName"
                                                placeholder="Add New Task"
                                                onChange={this.handleChange}
                                                ></Form.Control>
                                            </Col>
                                            <Col sm={2} className="my-1">
                                                <Button type="submit" onClick={(e, column_id, column_order) => this.onAddTask(e, item.id, index)}>+</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                        </Card.Footer>
                                    </Card>
                                </div>
                            )
                        })
                    }   

                </div>

                <Modal show={this.state.addNewColumnModal} onHide={this.onCloseAddNewColumnModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Column</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control type="text" 
                            placeholeder="New column title" 
                            name="columnName"
                            onChange={this.handleChange} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.onCloseAddNewColumnModal}>Cancel</Button>
                        <Button onClick={this.onSaveNewColumn}>Save</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default Board;