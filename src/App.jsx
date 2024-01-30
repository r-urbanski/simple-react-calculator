import { useEffect, useRef, useState } from 'react'

import './styles/style.scss'
import { evaluate } from 'mathjs'

const App = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [input, setInput] = useState('')
    const [result, setResult] = useState()
    const ref = useRef({})

    useEffect(() => {
        document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    const functionals = ['+', '-', '*', '/']

    const calc = () => {
        const isFunctionalLast = input.charAt(input.length - 2)

        let operation = input

        if (functionals.includes(isFunctionalLast)) {
            operation = operation.slice(0, -3)
            setInput(operation)
        }

        let result = evaluate(operation)

        // dobre po przecinku
        // if (result % 1 !== 0) {
        //     const resultString = String(result)
        //     const decimalPart = resultString.split('.')[1]

        //     for (let i = decimalPart.length - 1; i > 0; i--) {
        //         if (String(result.toFixed(i)).endsWith('0')) {
        //             result = parseFloat(result.toFixed(i - 1))
        //         } else break
        //     }
        // }

        return result
    }

    const handleClick = value => {
        const li = input.split(' ').pop()
        console.log(li)
        // animation
        if (ref.current[value]) {
            ref.current[value].classList.remove('animate')
            setTimeout(() => ref.current[value].classList.add('animate'), 10)
        }

        // change color theme
        if (value === 'theme') {
            setDarkMode(prev => !prev)
            return
        }

        // prevent from putting functional on the first char of operation
        if (input.length <= 0 && functionals.includes(value)) return

        // clear all inputs
        if (value === 'clear') {
            setInput('')
            setResult('')
            return
        }

        // slice last char
        if (value === 'slice') {
            setInput(prev => {
                let tempResult = -1
                let tempSlice = -1

                if (prev.charAt(prev.length - 2) === ' ') tempResult = -4
                else if (prev.endsWith(' ')) tempSlice = tempResult = -3

                setResult(evaluate(prev.slice(0, tempResult)))
                return prev.slice(0, tempSlice)
            })
            return
        }

        if (numbers.includes(value)) {
            const lastItem = input.split(' ').pop()
            if (lastItem.length >= 15) return
        }

        if (value === '.') {
            const lastItem = input.split(' ').pop()
            console.log(lastItem)
            if (lastItem.includes(value)) return
            if (input.length <= 0 || input.endsWith(' ')) {
                let result = '0.'
                setInput(prev => prev + result)
                setResult(evaluate(input + String(result)))
                return
            }
        }

        // if last char is functional, prevent from adding one another
        if (functionals.includes(value)) {
            setInput(prev => {
                let tempPrev = prev
                if (prev.endsWith(' ')) tempPrev = prev.slice(0, -3)
                return tempPrev + ` ${value} `
            })
            return
        }

        // calculate the operation
        if (value === '=') {
            if (input.length === 0) return
            if (input.endsWith('/ 0')) {
                setResult('Nie można dzielić przez zero')
                return
            }
            setInput(String(calc()))
            setResult()
        }
        // calculate temporary operation
        else {
            if (input.endsWith('/ ') && value === '0') {
                setResult('Nie można dzielić przez zero')
                return
            }
            const dotValue = value !== '.'
            const afterFunctional = input.charAt(input.length - 2) === ' ' && input.endsWith('0')
            const atTheBeginning = input === '0'
            if (dotValue && (atTheBeginning || afterFunctional)) {
                setInput(prev => {
                    let tempSlice = prev.slice(0, -1)
                    if (value !== 0) setResult(evaluate(tempSlice + String(value)))
                    return tempSlice + value
                })
                return
            }
            setInput(prev => prev + value)
            setResult(evaluate(input + String(value)))
        }
    }

    const handleView = input => {
        const array = input.split(' ')
        return array.map((item, index) => {
            if (functionals.includes(item)) {
                let faClass
                if (item === '+') faClass = 'plus'
                else if (item === '-') faClass = 'minus'
                else if (item === '*') faClass = 'xmark'
                else if (item === '/') faClass = 'divide'
                return <i key={index} className={`fa-solid fa-${faClass}`}></i>
            }
            return <span key={index}>{item}</span>
        })
    }

    const buttonsConfig = [
        { text: 'AC', type: 'functional clear', operation: 'clear' },
        { text: 'C', type: 'functional clear', operation: 'slice' },
        { text: <i className='fa-solid fa-moon'></i>, type: 'functional clear', operation: 'theme' },
        { text: <i className='fa-solid fa-divide'></i>, type: 'functional', operation: '/' },

        { text: '7', type: 'number', operation: '7' },
        { text: '8', type: 'number', operation: '8' },
        { text: '9', type: 'number', operation: '9' },
        { text: <i className='fa-solid fa-xmark'></i>, type: 'functional', operation: '*' },

        { text: '4', type: 'number', operation: '4' },
        { text: '5', type: 'number', operation: '5' },
        { text: '6', type: 'number', operation: '6' },
        { text: <i className='fa-solid fa-minus'></i>, type: 'functional', operation: '-' },

        { text: '1', type: 'number', operation: '1' },
        { text: '2', type: 'number', operation: '2' },
        { text: '3', type: 'number', operation: '3' },
        { text: <i className='fa-solid fa-plus'></i>, type: 'functional', operation: '+' },

        { text: '0', type: 'number zero', operation: '0' },
        { text: '.', type: 'functional normal', operation: '.' },
        { text: <i className='fa-solid fa-equals'></i>, type: 'functional full', operation: '=' },
    ]

    return (
        <main>
            <div className='calc-container'>
                <header className='display'>
                    <aside className='operation'>
                        <p>{handleView(input)}</p>
                    </aside>
                    <aside className='temp-result'>
                        <p>{result}</p>
                    </aside>
                </header>
                <section className='buttons'>
                    {buttonsConfig.map(({ text, type, operation }) => (
                        <button key={operation} className={type} ref={el => (ref.current[operation] = el)} onClick={() => handleClick(operation)}>
                            {text}
                        </button>
                    ))}
                </section>
            </div>
        </main>
    )
}

export default App
