const $ = el => {
  if(document.querySelectorAll(el).length === 1) return document.querySelector(el)

  return document.querySelectorAll(el)
}

const api = {
  get: async (url) => {
    const res = await fetch(url)
    
    if(res.ok) {
      return await res.json()
    } else {
      console.error("error")
    }
  },
  post: async (url, param) => {
    if(!param.body) return console.error("Body is missing")

    const { body, name } = param
    let data = new FormData()

    Object.keys(body).forEach(key => {
      data.append(key, body[key])
    })

    param.body = data

    const res = await fetch(url, {
      method: 'POST',
      ...param
    })

    if(res.ok) {
      return await res.json()
    } else {
      console.error("error")
    }
  }
}

const helpers = {
  recipeTemp(res) {
    $('.js-list-recipe').innerHTML = ''
    let temp = ''
    if(res.length === 0) {
      temp = "<div class='recipe__not-found'>No Results Found!</div>"
      $('.js-list-recipe').innerHTML = temp

      return false
    }

    res.forEach((item, key) => {
      const li = document.createElement('LI')
      li.classList.add('recipe__item')

      temp = `
        <div class="recipe__container">
          <div class="recipe__img-holder">
            <img src="public/${item.images.medium}" alt="${item.title}" class="recipe__img">
            <div class="recipe__button">
              <button class="button button--gradient-warning js-view-recipe" data-id="${item.uuid}">
                View Recipe
              </button>
            </div>
          </div>
          <div class="recipe__details">
            <div class="recipe__name">
              ${item.title}
            </div>
            <div class="recipe__description">
              ${item.description}
            </div>
          </div>
        </div>
      `

      li.innerHTML = temp

      setTimeout(() => {
        $('.js-list-recipe').append(li)

        document.querySelectorAll('.js-view-recipe').forEach(el => {
          const elem = el
          elem.onclick = e => {
            e.preventDefault()
            e.stopPropagation()
            $('body').style.overflow = 'hidden'
  
            helpers.viewRecipe(e)
  
            modalOverlay.style.display = 'block'
            modalOverlay.style.opacity = 1
          
            setTimeout(() => {
              modalContainer.style.opacity = 1
            }, 100)
          }
        })
      }, (300 * key))
    })
  },
  getAllRecipe() {
    api.get('http://localhost:3001/recipes')
    .then(res => {
      localStorage.setItem('recipe', JSON.stringify(res))
      
      helpers.recipeTemp(res)
    })
  },
  viewSpecial() {
    api.get('http://localhost:3001/specials')
    .then(res => {
      localStorage.setItem('specials', JSON.stringify(res))
    })
  },
  viewRecipe(e) {
    const elem = e.target
    const id = elem.dataset.id
    const recipe = JSON.parse(localStorage.getItem('recipe'))
    
    const thisRecipe = recipe.filter(item => item.uuid === id)[0]

    let ingTemp = ''

    thisRecipe.ingredients.forEach(ing => {
      const specials = JSON.parse(localStorage.getItem('specials'))
      const newSpecials = specials.filter(spcl => spcl.ingredientId === ing.uuid)[0]
      
      ingTemp += `
        <li class="modal__recipe-item">
          <span class="modal__recipe-amount">${ing.amount? ing.amount : ''} ${ing.measurement}</span> ${ing.name}
          <div class="modal__recipe-special" style="margin-top: ${newSpecials? '10px' : '0'}">
            <div class="modal__recipe-special-title">${newSpecials? newSpecials.title : ''}</div>
            <div class="modal__recipe-special-type">${newSpecials? newSpecials.type : ''}</div>
            ${newSpecials? newSpecials.text : ''}
          </div>
        </li>
      `
    })

    let procedureTemp = ''

    thisRecipe.directions.forEach(procedure => {
      procedureTemp += `
        <li class="modal__recipe-item">
          ${procedure.instructions}
        </li>
      `
    })
    
    const temp = `
      <div class="modal__img-holder">
        <img src="public/${thisRecipe.images.full}" alt="${thisRecipe.title}" class="modal__img">
        <div class="modal__recipe-name">
          ${thisRecipe.title}
        </div>
      </div>
      <div class="modal__recipe">
        <h2 class="modal__recipe-title">Food Recipe</h2>
        <div class="modal__recipe-info">Preparation Time: ${thisRecipe.prepTime} minutes</div>
        <div class="modal__recipe-info">Servings: ${thisRecipe.servings}</div>
        <div class="modal__recipe-subtitle">Ingredients:</div>
        <ul class="modal__recipe-list">
          ${ingTemp}
        </ul>
        <div class="modal__recipe-subtitle">Procedure:</div>
        <ul class="modal__recipe-list">
          ${procedureTemp}
        </ul>
      </div>
    `

    $('.js-recipe-view').innerHTML = temp
  }
}

helpers.viewSpecial()
helpers.getAllRecipe()

const modalContainer = $('.modal__container')
const modalOverlay = $('.modal__overlay')
const modalClose = $('.modal__close')

modalClose.onclick = e => {
  e.stopPropagation()
  modalContainer.style.opacity = 0

  setTimeout(() => {
    modalOverlay.style.opacity = 0

    setTimeout(() => {
      modalOverlay.style.display = 'none'
      $('body').style.overflow = 'auto'
    }, 300)
  }, 300)
}

$('.js-search').onchange = e => {
  const elem = e.target
  const value = elem.value
  let recipe = JSON.parse(localStorage.getItem('recipe'))
  
  let newRecipe = recipe.filter(item => item.title.toLowerCase().indexOf(value) !== -1)
  
  helpers.recipeTemp(newRecipe)
}