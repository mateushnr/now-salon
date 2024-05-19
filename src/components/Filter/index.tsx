import { FilterIcon, Search } from 'lucide-react'
import styles from './Filter.module.css'
import { useRef, useState } from 'react'

interface filterOption{
    value: string
    label: string
}

interface FilterProps {
    filterOptions: filterOption[]
    handleFilterList: (searchedValue:string, searchedOption: string) => void
    handleClearFilterList: () => void
}

export const Filter = ({filterOptions, handleFilterList, handleClearFilterList}: FilterProps) => {
    const [searchValue, setSearchValue] = useState('')

    const filterFormRef = useRef<HTMLFormElement>(null)

    const handleClickClearFilter = () =>{
        handleClearFilterList()
        setSearchValue('')
    }

    const handleClickFilterList = () => {
        const formFilter = filterFormRef.current

        if(formFilter !== null){
            const filterFormData = new FormData(formFilter);

            const searchedValue = filterFormData.get('filterValue')?.toString();
            const searchedOption = filterFormData.get('filterOption')?.toString();

            if(searchedValue && searchedOption){
                handleFilterList(searchedValue, searchedOption)
            }
        }
    }

    async function handleSubmitFilterForm(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()    
    }

    return(
    <>
        <form ref={filterFormRef} onSubmit={handleSubmitFilterForm} className={styles.formFilterContainer}>
            <section className={styles.sectionFilterOptions}>
                <div className={styles.titleFilter}>
                    <FilterIcon size={32} fill="#111"/>
                    <strong>Filtrar pesquisa por</strong>
                </div>

                {filterOptions.map((filterOption) => {
                    return (
                        <div key={filterOption.value} className={styles.radioInputContainer}>
                            <input type="radio" value={filterOption.value} id={filterOption.value} name="filterOption"/>
                            <label htmlFor={filterOption.value}>{filterOption.label}</label>
                        </div>
                    )
                })}
            </section>
            <section className={styles.sectionFilterInput}>
                <input type="text" value={searchValue} onChange={event => setSearchValue(event.target.value)} className={styles.searchInput} name="filterValue"/>

                <button onClick={handleClickFilterList} disabled={!searchValue} className={styles.filterButton}>
                    <Search/> Pesquisar
                </button>
                <button onClick={handleClickClearFilter} className={styles.searchAllButton}>
                    Limpar filtro
                </button>
            </section>
        </form>
    </>)
}