alert('🔥 SCRIPT LOADED!')

document.querySelector('.initial-loader')?.remove()

const root = document.getElementById('root')
if (root) {
  root.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">🔥 JAVASCRIPT IS WORKING!</h1>'
}