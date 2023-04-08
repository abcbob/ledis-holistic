var socket = io();
var tempNamespace = {};
var sizeNamespace = {};
var timeNamespace = {};
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value) {
            var command = document.createElement('li');
        	command.textContent = input.value;
        	messages.appendChild(command);
        	window.scrollTo(0, document.body.scrollHeight);
		const inputArr = input.value.split(" ");
		var item = document.createElement('li');
            if (inputArr[0] === "SET")
		{
			if (!inputArr[2])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else
			{
				var i = 2;
				var tmpString = "";
				while (inputArr[i])
				{
					tmpString += inputArr[i] +" ";
					i++;
				}
				tempNamespace[inputArr[1]] = tmpString;
				item.textContent = "OK";
			}
		}
		else if (inputArr[0] ==="GET")
		{
			if (inputArr[1] && !inputArr[2])
			{
				item.textContent = tempNamespace[inputArr[1]];
				if (!tempNamespace[inputArr[1]])
					item.textContent = "(nil)";
			}
			else
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
		}
		else if (inputArr[0] ==="RPUSH")
		{
			if (!inputArr[1] || !inputArr[2])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else
			{
				if (!tempNamespace[inputArr[1]])
				{
					tempNamespace[inputArr[1]] = [];
					sizeNamespace[inputArr[1]] = 0;
				}
				if (Array.isArray(tempNamespace[inputArr[1]]))
				{
					var i = 2;
					while (inputArr[i])
					{
						tempNamespace[inputArr[1]].push(inputArr[i]);
						sizeNamespace[inputArr[1]] = sizeNamespace[inputArr[1]] + 1;
						i++;
					}
					item.textContent = sizeNamespace[inputArr[1]];
				}
				else
				{
					item.textContent = "(error) WRONGTYPE Operation against a key holding the wrong kind of value";
				}
			}
		}
		else if (inputArr[0] ==="RPOP")
		{
			if (!inputArr[2])
			{
				item.textContent = tempNamespace[inputArr[1]].pop();
				sizeNamespace[inputArr[1]] = sizeNamespace[inputArr[1]] - 1;
			}
			else if (inputArr[2]>0)
			{
				for (let i = 1; i<=inputArr[2];i++)
				{
					socket.emit('output msg',i+") "+ tempNamespace[inputArr[1]].pop());
					sizeNamespace[inputArr[1]] = sizeNamespace[inputArr[1]] - 1;
				}
			}
			else if (!sizeNamespace[inputArr[1]])
				item.textContent ="(nil)";
		}
		else if (inputArr[0] ==="LRANGE")
		{
			for (let i = inputArr[2]; i<= inputArr[3]; i++)
				socket.emit('output msg',tempNamespace[inputArr[1]][i]);
		}
		else if (inputArr[0] ==="SADD")
		{
			if (!inputArr[1] || !inputArr[2])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else	if (!tempNamespace[inputArr[1]])
			{
				tempNamespace[inputArr[1]] = new Set();
				sizeNamespace[inputArr[1]] = 0;
			}
			var i = 2;
			var cnt = 0;
			while (inputArr[i])
			{
				if (!tempNamespace[inputArr[1]].has(inputArr[i]))
					cnt++;
				tempNamespace[inputArr[1]].add(inputArr[i]);
				sizeNamespace[inputArr[1]] = sizeNamespace[inputArr[1]] + 1;
				i++;
			}
			item.textContent = cnt;
		}
		else if (inputArr[0] ==="SREM")
		{
			if (!inputArr[1] || !inputArr[2])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else
			{
				var i = 2;
				var cnt = 0;
				while (inputArr[i])
				{
					if (tempNamespace[inputArr[1]].has(inputArr[i]))
					{
						cnt++;
						tempNamespace[inputArr[1]].delete(inputArr[i]);
					}
					sizeNamespace[inputArr[1]] = sizeNamespace[inputArr[1]] - 1;
					i++;
				}
				item.textContent = cnt;
			}
		}
		else if (inputArr[0] ==="SMEMBERS")
		{
			if (!inputArr[1])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else
			{
				const iterator = tempNamespace[inputArr[1]].values();
				for (let i = 0 ; i<sizeNamespace[inputArr[1]];i++)
				{
					socket.emit('output msg',iterator.next().value);
			 	}
			}
		}
		else if (inputArr[0] ==="SINTER")
		{
			item.textContent ="SINTER";
		}
		else if (inputArr[0] ==="KEYS")
		{
			var cnt = 1;
			for (var i in tempNamespace)
			{
				socket.emit('output msg',cnt +") " + i);
				cnt++;
			}
		}
		else if (inputArr[0] ==="DEL")
		{
			if (!inputArr[1])
			{
				item.textContent = "(error) ERR wrong number of arguments for command";
			}
			else
			{
				var i = 1;
				var cnt = 0;
				while (inputArr[i])
				{
					if (tempNamespace[inputArr[i]])
					{
						cnt++;
						tempNamespace[inputArr[i]] = 0;
					}
					i++;
				}
				item.textContent = cnt;
			}
		}
		else if (inputArr[0] ==="EXPIRE")
		{
			if (tempNamespace[inputArr[1]])
			{
				timeNamespace[inputArr[1]] = inputArr[2];
				item.textContent = inputArr[2];
			}
			else
				item.textContent = 0;
		}
		else if (inputArr[0] ==="TTL")
		{
			if (timeNamespace[inputArr[1]])
				item.textContent = timeNamespace[inputArr[1]];
			else if (tempNamespace[inputArr[1]])
				item.textContent = -1;
			else
				item.textContent = -2;
		}
		else
		{
			item.textContent = "(error) unknown command '" +input.value+"'";
		}
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
            input.value = '';
        }
      });
	socket.on('output msg', function(msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      });