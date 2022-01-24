const secondsToHms = d => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = Math.floor(d % 3600 % 60);
  const arr = []
  if(h > 0) arr.push(h + (h == 1 ? " hour" : " hours"))
  if(m > 0) arr.push(m + (m == 1 ? " minute" : " minutes"))
  if(s > 0) arr.push(s + (s == 1 ? " second" : " seconds"))
  return arr.join(', ');
}

(() => {
  const table = $('#table').DataTable({
    dom: `
      <"row"
        <"col"l>
        <"col text-center"B>
        <"col"f>
      >
      <"row"
        <"col"t>
      >
      <"row"
        <"col"i>
        <"col"p>
      >
      r`,
    buttons: [
      'copy', 'excel', 'pdf'
    ],
    columns: [
      {
        title: 'Activity',
        data: 'activity'
      },
      {
        title: 'Duration',
        data: row => secondsToHms(row.duration_seconds)
      }
    ]
  });

  const tasks = []
  const regex = /[A-Z]*-[0-9]+/g;

  document.getElementById('csvInput').addEventListener('change', (e) => {
    const csvInput = e.target
    if ('files' in csvInput) {
      tasks.length = 0
      table.clear().draw();
      const file = csvInput.files[0];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        step: row => {
          let activity = ''
          try {
            activity = row.data.activity.match(regex)[0];
          }catch(e){
            activity = row.data.activity;
          }
          const res = tasks.find(x => x.activity === activity)
          if(res){
            res.duration_seconds += row.data.duration_seconds
          }else{
            tasks.push({
              activity,
              duration_seconds: row.data.duration_seconds
            })
          }
        },
        complete: () => table.rows.add(tasks).draw()
      });
    }
  });
})();