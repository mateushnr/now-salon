import { Dispatch, SetStateAction } from 'react'
import styles from './ListTable.module.css'

type tableRowData = string[]

interface ListTableProps {
    tableHeaders: string[]
    tableData: tableRowData[]
    handleSelectionChange: () => void
}

export const ListTable = ({tableHeaders, tableData, handleSelectionChange}: ListTableProps ) =>{
    
    const handleRadioChange = () =>{
        handleSelectionChange()
    }

    return(
    <>
        <div className={styles.containerTable}>
            <table className={styles.listTable}>
                <thead className={styles.headerTable}>
                    <tr>
                        <th>Sel</th>
                        {tableHeaders.map(header => {
                            return (
                                <th key={header}>{header}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody className={styles.bodyTable}>
                    {tableData.length !== 0 ? tableData.map((dataRow, dataIndex)=>{
                        return (
                        <tr key={dataIndex}>
                            {dataRow.map((value, index) => {
                                if(index === 0){
                                    return(
                                        <td key={index} >
                                            <input
                                                onChange={handleRadioChange}
                                                type="radio" 
                                                value={value} 
                                                className={styles.selectedItem} name="selectedId"
                                            />
                                        </td>
                                    )  
                                }else{
                                    return (
                                        <td key={index}>{value}</td>
                                    )
                                }
                            })}
                        </tr>)
                    }) : null}
                </tbody>
            </table>
        </div>        
    </>)
}