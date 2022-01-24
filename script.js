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

// Copies a string to the clipboard. Must be called from within an
// event handler such as click. May return false if it failed, but
// this is not always possible. Browser support for Chrome 43+,
// Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
// Internet Explorer: The clipboard feature may be disabled by
// an administrator. By default a prompt is shown the first
// time the clipboard is used (per session).
const copyToClipboard = text => {
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData("Text", text);
  } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    let textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    }
    catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    }
    finally {
      document.body.removeChild(textarea);
    }
  }
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

  new Vue({
    el: "#app",
    data: {
      parent: "SPACE",
      story: "",
      verb: "FIX",
      description: ""
    },
    methods: {
      copy_branch_name(){
        const branch_name = this.$refs.branch_name;
        copyToClipboard(branch_name.innerText);
      },
      copy_branch_checkout(){
        var branch_checkout = this.$refs.checkout;
        copyToClipboard(branch_checkout.innerText);
      }
    }
  })

})();