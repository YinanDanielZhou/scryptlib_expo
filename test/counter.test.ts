import { expect } from 'chai'
import { loadDescription } from './helper'
import { buildContractClass } from '../src/contract'
import { bsv, num2bin, SigHashPreimage } from '../src'

describe('test.Counter', () => {


    it('should unlock success', () => {

        const Counter = buildContractClass(loadDescription('counter_desc.json'))
        let counter = new Counter()

        counter.setDataPartInASM('00')


        let callTx = new bsv.Transaction()
            .addDummyInput(counter.lockingScript, 1000)
            .setOutput(0, (tx) => {
                const newLockingScript = [counter.codePart.toASM(), num2bin(1, 1)].join(' ')
                const newAmount = tx.inputAmount - tx.getEstimateFee();
                return new bsv.Transaction.Output({
                    script: bsv.Script.fromASM(newLockingScript),
                    satoshis: newAmount
                })
            })
            .setInputScript(0, (tx) => {
                return counter.increment(new SigHashPreimage(tx.getPreimage(0)), tx.getOutputAmount(0)).toScript();
            })
            .seal();
        // verify all tx inputs
        expect(callTx.verify()).to.be.true

        // just verify the contract inputs
        expect(callTx.verifyInput(0).success).to.true


        let callTx1 = new bsv.Transaction()
            .addInputFromPrevTx(callTx)
            .setOutput(0, (tx) => {
                const newLockingScript = [counter.codePart.toASM(), num2bin(2, 1)].join(' ')
                const newAmount = tx.inputAmount - tx.getEstimateFee();
                return new bsv.Transaction.Output({
                    script: bsv.Script.fromASM(newLockingScript),
                    satoshis: newAmount
                })
            })
            .setInputScript(0, (tx) => {
                return counter.increment(new SigHashPreimage(tx.getPreimage(0)), tx.getOutputAmount(0)).toScript();
            })
            .seal();
        // verify all tx inputs
        expect(callTx1.verify()).to.be.true

        // just verify the contract inputs
        expect(callTx1.verifyInput(0).success).to.true


    })


    it('should unlock failed', () => {

        const Counter = buildContractClass(loadDescription('counter_desc.json'))
        let counter = new Counter()

        counter.setDataPartInASM('00')


        let callTx = new bsv.Transaction()
            .addDummyInput(counter.lockingScript, 1000)
            .setOutput(0, (tx) => {
                const newLockingScript = [counter.codePart.toASM(), num2bin(1, 1)].join(' ')
                const newAmount = tx.inputAmount - tx.getEstimateFee();
                return new bsv.Transaction.Output({
                    script: bsv.Script.fromASM(newLockingScript),
                    satoshis: newAmount
                })
            })
            .setInputScript(0, (tx) => {
                return counter.increment(new SigHashPreimage(tx.getPreimage(0)), 1).toScript();
            })
            .seal();


        // verify all tx inputs
        expect(callTx.verify()).to.be.eq('transaction input 0 VerifyError: SCRIPT_ERR_EVAL_FALSE_IN_STACK')

        // just verify the contract inputs
        const result = callTx.verifyInput(0)
        expect(result).to.deep.eq({
            success: false,
            error: "SCRIPT_ERR_EVAL_FALSE_IN_STACK",
            failedAt: {
                fExec: true,
                opcode: 106,
                pc: 1011
            }
        })

        const launchConfigErr = counter.genLaunchConfig(result, callTx);

        expect(launchConfigErr).to.includes("counter.scrypt#20")
        expect(launchConfigErr).to.includes("fails at OP_RETURN")
        expect(launchConfigErr).to.includes("Launch Debugger")

    })
})
