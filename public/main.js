users=[]
console.log('inside me')
console.log(users);
function bindinfo(sid,username,room)
{
  users.push({sid,username,room})
}

function getroomusers(room)
{
  arr=[];
  for(let i of users)
  {
    if( i.room==room)
    {
        arr.push(i.username);
    }
  }
  return arr;
}

function getcurrentuser(sid)
{
    d={};
    for(let i of users)
    {
        if(i.sid==sid)
        {
            d.username=i.username;
            d.room=i.room;
            break;
        }
    }
    return d;
}


function getroomusersexcept(sid,room)
{
    arr=[];
     for(let i of users)
     {
         if(i.room==room && i.sid!=sid)
         {
             arr.push(i.username);
         }
     }
     return arr;
}

function removeuser(sid)
{
    let index;
    let j=-1;
    for(let i of users)
     {
         j++;
         if( i.sid==sid)
         {
            index=j;
            break;
         }
     }

    if(index>=0 && index<users.length)
    {
        users.splice(index,1);
    }
}

function print()
{
console.log(users);
}

module.exports={
    bindinfo,
    getroomusers,
    getcurrentuser,
    getroomusersexcept,
    removeuser,
    print
}