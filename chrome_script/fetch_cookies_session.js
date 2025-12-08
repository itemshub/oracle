(async () => {
  const data = {
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
    cookies: document.cookie.split('; ').map(c => {
      const [name, ...rest] = c.split('=');
      return { name, value: rest.join('=') };
    })
  };
  console.log(JSON.stringify(data, null, 2));
})();
