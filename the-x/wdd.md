# Wiki-Driven Debugging

WDD is a software development practice concieved by Nate Sesti and J.B. Smith at Mayanalytics in Summer 2021. It aims to simultaneously help developers think through their roadblocks and provide a useful artifact for others who encounter the same problem in the future.

Once it is clear that you have encountered a roadblock, take the following steps:

1. Step back and consider precisely what your problem is.
2. Search the Wiki for your problem.
3. Fill in the start of a WDD template.
4. Imagine yourself explaining the issue to someone else.
5. Now attempt to solve the precise problem. (Just get that one thing to work, ignore other things for now)
6. Fill in the solution in the WDD template.

## Example WDD Template

- What are you trying to do?
- What is stopping you from doing it?
- Are there other ways to achieve what you are attempting?
- What code causes the error?
- What error messages can help identify the problem? (this helps others search the Wiki)
- How did you solve the problem?

## Wiki

Command: `initdb -D .postgres`

Error: `initdb: error: The program "postgres" is needed by initdb but was not found in the same directory as "/usr/local/Cellar/libpq/14.1/bin/initdb". Check your installation.`

Solution: `brew uninstall libpq`. The Homebrew path must come after the path to the other initdb, and is thus taking precedence. By uninstalling the homebrew version you will get the one which recognizes the location of postgres.

---

Error: The return values of transactions gotten with ethers make no sense.

Solution: `tx.data` refers to the inputs. You have to `await tx.wait()` and then get `.data` to get the return value of the transaction.

---

Error: I can't get the return value of a transaction with ethers.js.

Solution: You can only get the return value of a non-pure/view function on-chain, so from ethers.js you must get the info from an emitted event.

---

Error: I was able to isolate the line in Solidity code causing a reversion without a message, but when I try to cause reversions from inside this function (in an inherited contract) it reverts with an empty message.

Solution: Reversion messages don't carry outward in the scope. Only the fact that it was a reversion. WHAT YOU SHOULD DO is write unit tests for that core contract. It will have to happen eventually, so just test it now. And you will be able to see the reversion messages. Keep drilling down.

---

Error: Nonce too high. Expected nonce to be 9 but got 68. Note that transactions can't be queued when automining

Solution: Go to advanced settings in Metamask and reset account

---

Error: "Mapping terminated before handling trigger: oneshot canceled" Other than this error subgraph might otherwise seem to be working but queries show that it is empty.

Solution: Check that your graph-cli version matches the one used in the .yaml file. ex) 0.0.4 or 0.0.6. Moving to 0.0.4 fixed this for me on 1/16/22

---

Subjects: Apollo, GraphQL

Error: readQuery or readFragment is returning null even though the data is in the cache.

Solution: readQuery should only be used when you want to replicate an EXACT query that has been performed. If you want a different data shape, you must use readFragment. If readFragment isn't working, make sure the id you use is in the form of "Token:0x00roiwjfaoishj892jr0u093u", i.e., you must add the object type and a colon before the actual id.

---

Subjects: Solidity, Testing

Error: "ProviderError: Error: Transaction reverted: function call to a non-contract account"

Solution:
