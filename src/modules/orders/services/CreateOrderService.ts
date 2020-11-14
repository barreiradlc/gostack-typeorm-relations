import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id)

    if(!customerExists){
      throw new AppError('Could not find any customer with this id')
    }

    const existentProduct = await this.productsRepository.findAllById(products)

    if(!existentProduct.length){
      throw new AppError('Could not find any products with the given id')
    }

    const existentProductsIds = existentProduct.map(product => product.id)

    const checkInexistenProducts = products.filter(
      product => !existentProductsIds.includes(product.id)
    )

    if(checkInexistenProducts.length){
      throw new AppError(`Could not find product ${checkInexistenProducts[0].id}`)
    }

    const productsWithNoQuantity = products.filter(
      product => existentProduct.filter(p => p.id === product.id)[0].quantity < product.quantity
    )

    if(productsWithNoQuantity.length) {
      throw new AppError(`The quantity ${productsWithNoQuantity[0].quantity} is not available for ${productsWithNoQuantity[0].id}`)
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProduct.filter(p => p.id === product.id)[0].price
    }))

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts
    })

    
    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity: existentProduct.filter(p => p.id === product.id)[0].quantity - product.quantity
    }))
    
    // await this.ordersRepository.save(order)
    await this.productsRepository.updateQuantity(orderedProductsQuantity)

    return order;
  }
}

export default CreateOrderService;
