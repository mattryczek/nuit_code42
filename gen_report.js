const _dummy = setInterval(() => {}, 300000);

(async function main(){
    let jsonData = pm.response.json().data;
    let users;
    let allHolds = [];

    for (hold of jsonData.legalHolds) {
        hold.members = {};
        users = await getUsers(hold.legalHoldUid);
        hold.members = users;
        allHolds.push(hold);
    }

    exportData(allHolds);

    clearInterval(_dummy);
})();

function getUsers(uid){
    let memberArray = [];
    return new Promise((resolve, reject) => {
        pm.sendRequest({
            url:  'https://********/api/LegalHoldMembership?legalHoldUid=' + uid, 
            method: 'GET',
            header: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + pm.environment.get("Bearer_Token")
            }
        }, (err, res) => { 
            if (err){
                console.log(err);
                reject();
            } else {
                for(member of res.json().data.legalHoldMemberships){
                    memberArray.push(member.user);
                }
                resolve(memberArray);
            }
        });
    });
}

function exportData(data){
    pm.sendRequest({
        url: 'https://********.m.pipedream.net',
        method: 'POST',
        body: {
            mode: 'raw',
            raw: JSON.stringify(data)
        }
    }, function (err, res) {
            pm.test("Data Export Complete", function () {
                pm.response.to.have.status(200);
            });
    });
}